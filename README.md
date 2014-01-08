
This small Wakanda-6 application is used to log temperatures and humidities from two Allnet All4000 Ethernet Sensormeters at two independant locations.

The application is running on an internet hosted Wakanda-Server sending HTTP GETs to the All4000s every 12 Minutes to pick up the latest readings by the Sensormeters. The logged data may then be viewed with a chart widget when connecting to the Wakanda server with a browser.

A local version of the application will sync its data store to the data store of the remote Wakanda server using Json queries. This way i can experiment with Wakanda locally using current data.

The application is serving me to learn and experiment with Wakanda. 


Please visit [www.wakanda.org](http://www.wakanda.org "wakanda.org") for more information.