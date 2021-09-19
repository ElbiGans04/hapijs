import request from "./request-lib";
import routes from "./route-lib";
import jwt from "hapi-auth-jwt2";
import images from './image/'

// mendaftarkan semua plugin
// telah dibuat
const plugins = [jwt, request, images, routes];

export default plugins;
