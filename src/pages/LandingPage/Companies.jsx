import styles from "./Companies.module.css";
import adobe from "../../../public/images/companies/adobe.png";
import elastic from "../../../public/images/companies/elastic.png";

import airtable from "../../../public/images/companies/airtable.png";

import opendoor from "../../../public/images/companies/opendoor.png";
import framer from "../../../public/images/companies/framer.png";

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
