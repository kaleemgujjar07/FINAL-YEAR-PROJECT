const useAppSettings = () => {
  let settings = {};
  settings['cognivio_app_email'] = 'noreply@cognivioapp.com';
  settings['cognivio_base_url'] = 'https://cloud.cognivioapp.com';
  return settings;
};

module.exports = useAppSettings;
