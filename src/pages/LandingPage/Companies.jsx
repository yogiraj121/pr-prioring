import styles from "./Companies.module.css";
import adobe from "../../assets/companies/adobe.png";
import elastic from "../../assets/companies/elastic.png";

import airtable from "../../assets/companies/airtable.png";

import opendoor from "../../assets/companies/opendoor.png";
import framer from "../../assets/companies/framer.png";

const Companies = () => {
  return (
    <div className={styles.Companies}>
      <img src={adobe} alt="adobe" />
      <img src={elastic} alt="elastic" />
      <img src={airtable} alt="airtable" />
      <img src={framer} alt="framer" />
      <img src={elastic} alt="elastic" />
      <img src={opendoor} alt="opendoor" />
    </div>
  );
};
export default Companies;
