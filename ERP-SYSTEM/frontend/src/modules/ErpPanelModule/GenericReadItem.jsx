import { useEffect, useState } from 'react';
import { Row, Col, Divider, Descriptions, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { EditOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { selectCurrentItem } from '@/redux/erp/selectors';
import { useNavigate } from 'react-router-dom';
import { generate as uniqueId } from 'shortid';
import dayjs from 'dayjs';
import { useDate } from '@/settings';

const valueByString = (obj, path) => {
  if (Array.isArray(path)) {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

export default function GenericReadItem({ config, selectedItem }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME, dataTableColumns } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dateFormat } = useDate();

  const { result: currentResult } = useSelector(selectCurrentItem);
  const [currentErp, setCurrentErp] = useState(selectedItem ?? {});

  useEffect(() => {
    if (currentResult) {
      setCurrentErp(currentResult);
    }
  }, [currentResult]);

  const renderValue = (val) => {
    if (typeof val === 'boolean') {
      return val ? translate('Yes') : translate('No');
    }
    if (typeof val === 'string' && Date.parse(val) && val.includes('T') && val.includes('Z')) {
      return dayjs(val).format(dateFormat);
    }
    return val !== undefined && val !== null ? String(val) : '-';
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} Details`}
        ghost={false}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('Close')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: 'update',
                  data: currentErp,
                })
              );
              navigate(`/${entity.toLowerCase()}/update/${currentErp._id}`);
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('Edit')}
          </Button>,
        ]}
        style={{ padding: '20px 0px' }}
      >
      </PageHeader>
      <Divider dashed />
      <Descriptions title={translate('Information')} bordered>
        {dataTableColumns ? (
          dataTableColumns.map((col, index) => {
            const val = valueByString(currentErp, col.dataIndex);
            
            // Skip action columns or empty titles
            if (col.key === 'action' || !col.title) return null;

            return (
              <Descriptions.Item key={index} label={col.title}>
                {col.render ? col.render(val, currentErp) : renderValue(val)}
              </Descriptions.Item>
            );
          })
        ) : (
          Object.entries(currentErp).map(([key, val]) => {
            if (key === '_id' || key === '__v') return null; // Skip internal fields
            return (
              <Descriptions.Item key={key} label={translate(key)}>
                {renderValue(val)}
              </Descriptions.Item>
            );
          })
        )}
      </Descriptions>
    </>
  );
}
