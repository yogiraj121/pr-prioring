import styles from "./Header.module.css";
import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate("/login");
  };
  const handleOnSignUp = () => {
    navigate("/signup");
  };
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <img src={Logo} alt="logo" className={styles.img} />
      </div>
      <div className={styles.buttons}>
        <button className={styles.button1} onClick={handleOnClick}>
          Login
        </button>
        <button className={styles.button2} onClick={handleOnSignUp}>
          Sign Up
        </button>
      </div>
    </div>
  );
};
export default Header;
