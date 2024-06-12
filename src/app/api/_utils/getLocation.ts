import { IPGeolocationAPI } from 'ip-geolocation-api-sdk-typescript';
import { GeolocationParams } from 'ip-geolocation-api-sdk-typescript/GeolocationParams';

const ipgeolocationApi = new IPGeolocationAPI(
  process.env.IP_GEOLOCATION_API_KEY as string
);

export async function getIpLocation(ipAddress: string) {
  let response: any;
  const geolocationParams = new GeolocationParams();
  //   geolocationParams.setIPAddress(ipAddress);
  //   geolocationParams.setFields('geo');
  geolocationParams.ipAddress = ipAddress;

  ipgeolocationApi.getGeolocation((json) => {
    response = json;
  }, geolocationParams);
  return response;
}
