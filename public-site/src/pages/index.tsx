import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import style from './index.module.css';
import '../css/custom.css'

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <div className={style.app}>
            <main className={style.home}>
                <header className={style.title}>
                    <h1 className={style.mainTitle}>Welcome to Radix</h1>
                </header>
                <div>
                    <h1 className={style.title}>
                        Radix makes your app develop
                    </h1>
                    <HomepageFeatures/>
                    <p>You provide your code and a Dockerfile to build
                        it, and Radix will take it from there.
                    </p>
                    <div className={style.buttonsContainer1}>
                        <Link
                            to="/docs/start/">
                            Get started
                        </Link>
                        <Link
                            to="/docs/docs/">
                            Read the docs
                        </Link>
                        <Link
                            to="/docs/community/">
                            Our community
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function Home(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title={`Hello from ${siteConfig.title}`}
            description="Description will go into a meta tag in <head />">
            <HomepageHeader/>
        </Layout>
    );
}
