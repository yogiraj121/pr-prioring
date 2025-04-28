import styles from "./Hero.module.css";
import HeroImg from "../../assets/heroImage.png";
import heroCalender from "../../assets/heroCalender.png";
import heroGraph from "../../assets/herograph.png";
import heroComment from "../../assets/heroComment.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className={styles.hero}>
      <div className={styles.heroHeading}>
        <div>
          <h1
            style={{ color: "#303404D", fontSize: "54px", fontWeight: "bold" }}
          >
            Grow Your Business Faster <br />
            with Hubly CRM
          </h1>
          <p style={{ color: "#303404D", fontSize: "16px" }}>
            Manage leads, automate workflows, and close deals effortlessly—all
            in one powerful platform.
          </p>
        </div>
        <div className={styles.buttons}>
          <Link to="/signup">
            <button className={styles.button1}>Get Started </button>
          </Link>

          <button className={styles.button2}>Watch video</button>
        </div>
      </div>

      <div className={styles.heroImg}>
        <img src={HeroImg} alt="" className={styles.mainImg} />
        <div className={styles.leftBottom}>
          <img
            src={heroCalender}
            alt=""
            style={{
              width: "250px",
              height: "180px",
              objectFit: "cover",
              backgroundColor: "transparent",
            }}
          />
        </div>
        <div className={styles.rightBottom}>
          <img
            src={heroGraph}
            alt=""
            style={{
              width: "212px",
              height: "132px",
              objectFit: "cover",
              backgroundColor: "transparent",
            }}
          />
        </div>
        <div className={styles.rightTop}>
          <img
            src={heroComment}
            alt=""
            style={{
              width: "286px",
              height: "65px",
              objectFit: "cover",
              backgroundColor: "transparent",
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default Hero;
