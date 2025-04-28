import React from "react";
import styles from "./Footer.module.css";
import logo from "../../assets/logo.png";
import social from "../../assets/socialIcons.png";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.logoCol}>
          <img src={logo} alt="Hubly logo" className={styles.logoImg} />
        </div>
        <div className={styles.linksCol}>
          <div>
            <h4 className={styles.heading}>Product</h4>
            <ul>
              <li>Universal checkout</li>
              <li>Payment workflows</li>
              <li>Observability</li>
              <li>UpliftAI</li>
              <li>Apps & integrations</li>
            </ul>
          </div>
          <div>
            <h4 className={styles.heading}>Resources</h4>
            <ul>
              <li>Blog</li>
              <li>Success stories</li>
              <li>News room</li>
              <li>Terms</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
        <div className={styles.linksCol}>
          <div>
            <h4 className={styles.heading}>Why Primer</h4>
            <ul>
              <li>Expand to new markets</li>
              <li>Boost payment success</li>
              <li>Improve conversion rates</li>
              <li>Reduce payments fraud</li>
              <li>Recover revenue</li>
            </ul>
          </div>
          <div>
            <h4 className={styles.heading}>Company</h4>
            <ul>
              <li>Careers</li>
            </ul>
          </div>
        </div>
        <div className={styles.linksCol}>
          <div>
            <h4 className={styles.heading}>Developers</h4>
            <ul>
              <li>Primer Docs</li>
              <li>API Reference</li>
              <li>Payment methods guide</li>
              <li>Service status</li>
              <li>Community</li>
            </ul>
          </div>
          <div className={styles.socialRow}>
            <img
              src={social}
              alt="Social icons"
              className={styles.socialIcons}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
