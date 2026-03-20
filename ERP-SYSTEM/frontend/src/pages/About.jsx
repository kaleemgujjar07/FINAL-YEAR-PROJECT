import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'COGNIVIO'}
      subTitle={translate('Do you need help on customize of this app')}
      extra={
        <>
          <p>
            Website : <a href="https://www.cognivioapp.com">www.cognivioapp.com</a>{' '}
          </p>
          <p>
            GitHub :{' '}
            <a href="https://github.com/cognivio/cognivio-erp-crm">
              https://github.com/cognivio/cognivio-erp-crm
            </a>
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open(`https://www.cognivioapp.com/contact-us/`);
            }}
          >
            {translate('Contact us')}
          </Button>
        </>
      }
    />
  );
};

export default About;
