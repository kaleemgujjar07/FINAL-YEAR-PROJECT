const useDate = ({ settings }) => {
  const { cognivio_app_date_format } = settings;

  const dateFormat = cognivio_app_date_format;

  return {
    dateFormat,
  };
};

module.exports = useDate;
