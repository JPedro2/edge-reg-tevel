import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faCompass } from "@fortawesome/free-solid-svg-icons";
import useDemoControls from "components/common/DemoSettings";
import useSSR from "components/common/SSR";
import Image from "next/image";


export default function Form({ applianceId }) {
  const appliance = useRef(null);
  const applianceLabel = useRef(null);
  const applianceName = useRef(null);
  const [isDisabled, setDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applianceValue, setApplianceValue] = useState(applianceId || "");
  const [applianceLabelValue, setApplianceLabelValue] = useState("");
  const [applianceNameValue, setApplianceNameValue] = useState("");

  const { name, selectionLabel, logo } = useDemoControls();

  async function fun() {
    setDisabled(true);

    console.log("hello");
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.log("> Scan started");

      ndef.addEventListener("readingerror", () => {
        console.log(
          "Argh! Cannot read data from the NFC tag. Try another one?"
        );
      });

      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        console.log(`> Serial Number: ${serialNumber}`);
        console.log(`> Records: (${message.records.length})`);

        const decoder = new TextDecoder();
        for (const record of message.records) {
          if (record.recordType === "text") {
            const data = decoder.decode(record.data);
            console.log(`data ${data}`);

            appliance.current.value = data;
            // const article =/^[aeio]/i.test(json.title) ? "an" : "a";
            // console.log(`${json.name} is ${article} ${json.title}`);
          }
        }
      });
    } catch (error) {
      console.log("Argh! " + error);
    }
  }

  const isSSR = useSSR();

  return (
    <div className={styles.container}>
      <div className={styles.logoWrap}>
        {isSSR ? null : (
          <img className={styles.logo} src={logo} alt="demo logo" />
        )}
      </div>
      <h1 className={styles.title}>
      <span className="accent">{name}</span> Edge Host Registration!
      </h1>
      <p className={styles.description}>
        Register the Edge Host with Palette
        {/* <code className={styles.code}>pages/no-js-from.js</code> */}
      </p>

      <form
        action="/api/form"
        method="post"
        onSubmit={() => setIsSubmitting(true)}
      >
        <label htmlFor="appliance">Edge Machine ID</label>
          <div style={{ display: "flex" }}>
            <input
              value={applianceValue}
              onChange={(ev) => setApplianceValue(ev.target.value)}
              style={{ flexGrow: 1 }}
              type="text"
              ref={appliance}
              id="appliance"
              name="appliance"
              required
            />
          
            <button
              className={styles.scan}
              disabled={isDisabled}
              onClick={fun}
            >
              <FontAwesomeIcon icon={faCompass} />
            </button>
          </div>
        <label htmlFor="name">Device Name</label>
        <div style={{ display: "flex" }}>
          <input
            value={applianceNameValue}
            onChange={(ev) => setApplianceNameValue(ev.target.value)}
            style={{ flexGrow: 1 }}
            type="text"
            ref={applianceName}
            id="applianceName"
            name="applianceName"
            required
          />
        </div>
        <label htmlFor="name">{selectionLabel}</label>
        <input name="labelType" value={selectionLabel} type="hidden" />
        <div style={{ display: "flex" }}>
          <input
            value={applianceLabelValue}
            onChange={(ev) => setApplianceLabelValue(ev.target.value)}
            style={{ flexGrow: 1 }}
            type="text"
            ref={applianceLabel}
            id="applianceLabel"
            name="applianceLabel"
            required
          />
        </div>
        <label htmlFor="paletteProject">Region</label>
        <select id="project" name="project" required>
          <option value="US West">
            US West
          </option>
          <option value="US East">
            US East
          </option>
          <option value="Europe">
            Europe
          </option>
        </select>


        <button type="submit" disabled={isSubmitting}>
          Submit
          {isSubmitting ? <FontAwesomeIcon icon={faCircleNotch} spin /> : null}
        </button>
      </form>
    </div>
  );
}

export function getServerSideProps({ query }) {
  return {
    props: {
      applianceId: query["appliance-id"] || "",
    },
  };
}
