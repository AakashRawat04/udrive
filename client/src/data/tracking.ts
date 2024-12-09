export interface TrackingData {
  BoxId: string;
  VehName: string;
  DriverName: string;
  Speed: number;
  Location: string;
  Lastdate: string;
  Distance: string;
  Latitude: string;
  Longitude: string;
  VehicleStatus: string;
  ACStatus: string;
  RouteNo: string | null;
  RouteName: string | null;
  Busno: string | null;
  Vstatus: number;
  ResponseStatus: {
    Status: boolean;
    ErrorCode: string | null;
    StackTrace: string | null;
    Message: string | null;
    Error: string | null;
  };
}