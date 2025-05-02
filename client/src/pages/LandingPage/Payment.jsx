import React from "react";
import styles from "./styles/Payment.module.css";

const plans = [
  {
    name: "STARTER",
    price: "$199",
    period: "/monthly",
    description:
      "Best for local businesses needing to improve their online reputation.",
    features: [
      "Unlimited Users",
      "GMB Messaging",
      "Reputation Management",
      "GMB Call Tracking",
      "24/7 Award Winning Support",
    ],
    button: "SIGN UP FOR STARTER",
  },
  {
    name: "GROW",
    price: "$399",
    period: "/monthly",
    description:
      "Best for all businesses that want to take full control of their marketing automation and track their leads, click to close.",
    features: [
      "Pipeline Management",
      "Marketing Automation Campaigns",
      "Live Call Transfer",
      "GMB Messaging",
      "Embed-able Form Builder",
      "Reputation Management",
      "24/7 Award Winning Support",
    ],
    button: "SIGN UP FOR STARTER",
  },
];

const Payment = () => {
  return (
    <section className={styles.pricingSection}>
      <h2 className={styles.title}>We have plans for everyone!</h2>
      <p className={styles.subtitle}>
        We started with a strong foundation, then simply built all of the sales
        and marketing tools ALL businesses need under one platform.
      </p>
      <div className={styles.cardsContainer}>
        {plans.map((plan) => (
          <div className={styles.card} key={plan.name}>
            <div className={styles.cardHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planDescription}>{plan.description}</p>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.price}>{plan.price}</span>
              <span className={styles.period}>{plan.period}</span>
            </div>
            <div className={styles.featuresSection}>
              <p className={styles.featuresTitle}>What's Included</p>
              <ul className={styles.featuresList}>
                {plan.features.map((feature, i) => (
                  <li key={i} className={styles.featureItem}>
                    <span className={styles.checkmark}>✔</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button className={styles.signupBtn}>{plan.button}</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Payment;
