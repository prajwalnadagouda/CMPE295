const backendUrl = `${process.env.REACT_APP_BACKEND_URI}`;
const token = localStorage.getItem("token");
const headers = {
  token: token,
};
export { backendUrl, headers };
