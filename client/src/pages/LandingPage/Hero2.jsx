import React from "react";
import styles from "./styles/Hero2.module.css";
import hero2 from "../../../public/images/hero2.png";
import hero2Social from "../../../public/images/hero2Social.png";

const Hero2 = () => {
  return (
    <section className={styles.hero2}>
      <div className={styles.hero2Headings}>
        <h2 className={styles.hero2Heading}>
          At its core, Hubly is a robust CRM solution.
        </h2>
        <p className={styles.hero2Para}>
          Hubly helps businesses streamline customer interactions, track leads,
          and automate tasks—saving you time and maximizing revenue. Whether
          you're a startup or an enterprise, Hubly adapts to your needs, giving
          you the tools to scale efficiently.
        </p>
      </div>
      <div className={styles.hero2part}>
        <div className={styles.left}>
          <div className={styles.subHeading}>
            <strong>MULTIPLE PLATFORMS TOGETHER!</strong>
            <p>
              Email communication is a breeze with our fully integrated, drag &
              drop email builder.
            </p>
          </div>
          <div className={styles.subHeading}>
            <strong>CLOSE</strong>
            <p>
              Capture leads using our landing pages, surveys, forms, calendars,
              inbound phone system & more!
            </p>
          </div>
          <div className={styles.subHeading}>
            <strong>NURTURE</strong>
            <p>
              Capture leads using our landing pages, surveys, forms, calendars,
              inbound phone system & more!
            </p>
          </div>
        </div>
        <div className={styles.right}>
          <img
            src={hero2Social}
            alt="Social platforms"
            className={styles.social}
            style={{ width: "295px", height: "131px" }}
          />
          <img src={hero2} alt="CRM Funnel" className={styles.cup} />
        </div>
      </div>
    </section>
  );
};

export default Hero2;
