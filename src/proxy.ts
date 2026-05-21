export { proxy } from "./middleware/proxy";

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
