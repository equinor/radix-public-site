import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import ThemedImage from '@theme/ThemedImage';

type Card = {
  name: string;
  image: string;
  description: JSX.Element;
};

const TeamCardList: Card[] = [
  {
    name: 'Atle Wilson',
    image: 'images/radix-atle.jpg',
    description: (
      <>
          Product Owner
      </>
    ),
  },
  {
    name: 'Richard Hagen',
    image: 'images/radix-richard.jpg',
    description: (
      <>
          Developer
      </>
    ),
  },
  {
    name: 'Svein-Petter Johnsen',
    image: 'images/radix-svein-petter-johnsen.jpg',
    description: (
      <>
          Infrastructure
      </>
    ),
  },
  {
    name: 'Nils Gustav Stråbø',
    image: 'images/radix-nils-gustav-strabo.jpg',
    description: (
      <>
          Developer
      </>
    ),
  },
  {
    name: 'Elsa Mäyrä Irgens',
    image: 'images/radix-elsa-mayra-irgens.jpg',
    description: (
      <>
          Team Leader
      </>
    ),
  },
  {
    name: 'Sergey Smolnikov',
    image: 'images/radix-sergey-smolnikov.jpg',
    description: (
      <>
          Developer
      </>
    ),
  },
];

function Card({name, image, description}: Card) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.cardContent}>
          <ThemedImage
              alt={name}
              sources={{
                  light: useBaseUrl(image),
                  dark: useBaseUrl(image),
              }}
          />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{name}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function RadixTeam(): JSX.Element {
  return (
    <section className={styles.teamCards}>
      <div className="container">
        <div className="row">
          {TeamCardList.map((props, idx) => (
            <Card key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
