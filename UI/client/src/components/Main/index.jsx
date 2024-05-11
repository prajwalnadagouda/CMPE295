import styles from "./styles.module.css";

const Main = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <h1>Easy Shuttle</h1>
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <h2
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          lineHeight: "500px",
        }}
      >
        Welcome User
      </h2>
    </div>
  );
};

export default Main;
