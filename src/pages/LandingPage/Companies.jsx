import styles from "./Companies.module.css";
import adobe from "../../../public/images/adobe.png";
import elastic from "../../../public/images/elastic.png";

import airtable from "../../../public/images/airtable.png";

import opendoor from "../../../public/images/opendoor.png";
import framer from "../../../public/images/framer.png";

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
