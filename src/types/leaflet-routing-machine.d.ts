declare module 'leaflet-routing-machine' {
  import * as L from 'leaflet';

  namespace Routing {
    function control(options: any): any;
    class Control extends L.Control {
      constructor(options?: any);
      on(type: string, fn: (event: any) => void, context?: any): this;
    }
  }

  export = Routing;
}
