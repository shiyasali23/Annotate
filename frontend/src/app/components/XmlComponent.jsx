"use client";

import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const XmlComponent = () => {
  const retunXml = () => {
    return `<annotation>
    <folder>images</folder>
    <filename>example_image.jpg</filename>
    <path>/path/to/example_image.jpg</path>
    <source>
        <database>Unknown</database>
    </source>
    <size>
        <width>800</width>
        <height>600</height>
        <depth>3</depth>
    </size>
    <segmented>0</segmented>
    <object>
        <name>cat</name>
        <pose>Unspecified</pose>
        <truncated>0</truncated>
        <difficult>0</difficult>
        <bndbox>
            <xmin>100</xmin>
            <ymin>150</ymin>
            <xmax>400</xmax>
            <ymax>350</ymax>
        </bndbox>
    </object>
    <object>
        <name>dog</name>
        <pose>Unspecified</pose>
        <truncated>0</truncated>
        <difficult>0</difficult>
        <bndbox>
            <xmin>500</xmin>
            <ymin>200</ymin>
            <xmax>750</xmax>
            <ymax>450</ymax>
        </bndbox>
    </object>
</annotation>`;
  };

  const xmlData = retunXml();

  return (
    <SyntaxHighlighter language="xml" style={docco}>
      {xmlData}
    </SyntaxHighlighter>
  );
};

export default XmlComponent;