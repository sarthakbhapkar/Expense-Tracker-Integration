import axios from "axios";

const CLOUDIO_BASE = process.env.REACT_APP_CLOUDIO_BASE || "";
const CLOUDIO_PUBLIC_KEY = process.env.REACT_APP_CLOUDIO_PUBLIC_KEY || "";

if (!CLOUDIO_BASE) {
  console.warn("REACT_APP_CLOUDIO_BASE not set.");
}

export const cloudio = axios.create({
  baseURL: CLOUDIO_BASE,
  headers: {
    "Content-Type": "application/json",
    ...(CLOUDIO_PUBLIC_KEY ? { "x-api-key": CLOUDIO_PUBLIC_KEY } : {}),
  },
});
