import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Build',
    Svg: require('@site/static/images/icons/fig_tools_icon.svg').default,
    description: (
      <>
          Commit code to trigger a build ⚙️, run tests ✅ and check dependencies 🌲
      </>
    ),
  },
  {
    title: 'Deploy',
    Svg: require('@site/static/images/icons/fig_rocket_icon.svg').default,
    description: (
      <>
          Place your app in the cloud ☁️ in multiple environments 🌏 and let it grow 🌱
      </>
    ),
  },
  {
    title: 'Monitor',
    Svg: require('@site/static/images/icons/fig_screen_icon.svg').default,
    description: (
      <>
          Track usage to find problems 💣 and get insight💡
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
