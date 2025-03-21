"use client";

import React from "react";

const AboutUs = () => {
  return (
    <div className="w-full h-full my-20">
      
      <div className="w-full px-10 xl:px-32 py-5 gap-20 flex flex-col">
        <h1 className="text-base leading-[2rem] font-semibold ">
          <span className="font-bold text-3xl mr-2">Biolabs</span>an
          organization founded on October 4th of 2024, designed to keeping
          humans healthy. Built on top of the most advanced, cutting-edge
          technologies and backed by the world's elite medical experts and
          healthcare professionals.Our architecture extent from individuals
          users to every insitution that can contiribute to our vision.
        </h1>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold underline underline-offset-4">
            Biolabs <span className="text-lg">(v1.0.0):</span>
          </h1>

          <div className="flex flex-col px-5">
            <span className="font-bold text-lg ">Diseases Detection:</span>
            <h1 className=" ml-5 text-sm leading-[1.5rem] font-semibold">
              By analysing various biometrics and biochemicals, multiple systems
              is created that can detect various kinds of diseases in very high
              accuracy. Helps to get an early notice about the diseases that can
              be cause, without get into time consuming lab tests.
            </h1>
          </div>

          <div className="flex flex-col px-5">
            <h1 className="font-bold text-lg ">Dignosis Center:</h1>
            <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold">
              A usual dignosis procedures, the system is capable to percive
              symptoms and provide an assumption assistance, also provide
              Medications, Precausions and Diets that can be considered. Also
              can be served as an assiatnce for doctors to get an second opinion
              for their findings
            </h1>
          </div>

          <div className="flex flex-col px-5">
            <h1 className="font-bold text-lg ">Food Recommendation:</h1>
            <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold">
              Considering health metrics and biochemical levels, reccommends
              optimal food choices. It also functions as a virtual dietitian,
              offering detailed nutritional information on a wide range of food
              items. Access how each food and nutrients couples each other with
              precise data
            </h1>
          </div>

          <div className="flex flex-col px-5">
            <h1 className="font-bold text-lg ">Analytics Platform:</h1>
            <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold">
              Meaningful dashboards to provide maximum insights into the
              biochemicals. Determine from normal to abnormal values. To
              understand potential health condition that fall outside the
              healthy range. Tracking system for biochemical parameters over
              time to catch anomalies
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold underline underline-offset-4">
            Biolabs <span className="text-lg">(v2.0.0) Up Comming:</span>
          </h1>

          <div className="flex flex-col px-5">
            <span className="font-bold text-lg">Bio Intelligence:</span>
            <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold">
              Personalized health assistant powered by artificial intelligence
              seamlessly integrated with all of our services. Designed to
              provide every possible comprehensive health insights and expert
              level guidance empowering to make informed decisions
            </h1>
          </div>

          <div className="flex flex-col px-5">
            <h1 className="font-bold text-lg ">Bio Vault:</h1>
            <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold">
              Secure space that allows to store any kind of medical
              informations digitally. From reports and prescriptions to personal health
              notes and observations. That can be also shared with trusted
              individuals. To gain insights, track conditions to make informed
              decisions
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold underline underline-offset-4">
            Biolabs <span className="text-lg">(3.0.0) Up Comming:</span>
          </h1>

          <div className="flex flex-col px-5">
            <span className="font-bold text-lg">Bio Fold:</span>
            <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold">
              Using advanced protein folding and molecular docking to design
              custom medications that perfectly matches unique biology. Through
              quantum-enhanced computational models, simulate how compounds
              interact with specific cellular receptors at the molecular
              level.To boost therapeutic outcomes by ensuring optimal
              drug-target interactions while minimizing adverse effects
            </h1>
          </div>

          <div className="flex flex-col px-5">
            <h1 className="font-bold text-lg ">Bio Genes:</h1>
            <h1 className="ml-5 text-sm leading-[1.5rem] font-semibold">
              Genetic analysis to identify inherited health risks by comparing
              DNA with similar profiles. Advanced algorithms detect subtle
              genetic variations that traditional tests miss, enabling early
              intervention before symptoms appear wich shifts healthcare from
              reactive to preventative
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl w-full text-center font-bold underline underline-offset-4">
            Vision
          </h1>

          <h1 className="text-sm leading-[2rem] font-semibold">
            For the time beigh of a human lives health is the most valuable
            thing.Our vision is a world where every individual, regardless of
            location, has access to essential tools and resources for
            maintaining optimal wellbeing. We're committed to eliminating
            barriers for communities in remote regions with limited healthcare
            facilities, offering innovative solutions that provide valuable
            medical insights without financial strain. Through our approach,
            we're building a future where geographic isolation and economic
            constraints no longer prevent anyone from achieving their fullest
            health potential.
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl w-full text-center font-bold underline underline-offset-4">
            Capable Of
          </h1>

          <h1 className="text-sm leading-[2rem] font-semibold">
            Our platform can be used as a personalized healthcare assistance
            shaped for each users.Also can be connect with any health care
            providers like hospitals. Wich can learns from local health patterns
            to offer helpful insights, making it easier for doctors, nurses or
            any other proffesional to make better treatment and automate
            dignosis.
          </h1>

          <h1 className="text-sm leading-[2rem] font-semibold">
            Imagine connecting each and every healthcare information worldwide
            to bringing global health knowledge under one umbrella. The true
            power of our solution emerges. We can identify emerging health
            trends, guide the development and delivery of new medications,
            pinpoint regions with healthcare worker shortages, and discover gaps
            in medical equipment and pharmaceutical availability. This
            comprehensive approach doesn't just improve individual care wich
            strengthens the entire healthcare ecosystem by creating a foundation
            for more targeted and effective medical innovations.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
