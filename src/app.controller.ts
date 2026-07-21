import { Controller, Get} from "@nestjs/common";
import { PublicRoute } from "src/Common/Decorators/public.decorator";

@Controller("health")
class AppController {
  @Get()
  @PublicRoute()
  healthCheck() {
    return {
      app_version: process.env.APP_VERSION,
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      };
  }
}
export { AppController };