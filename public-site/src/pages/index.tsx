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
                <div className={style.title2}>
                    <h1 className={style.title}>
                        Radix makes your app develop</h1>
                </div>
                <HomepageFeatures/>
                <div className={style.title3}>
                    <p>You provide your code and a Dockerfile to build
                        it, and Radix will take it from there.
                    </p>
                    <div className={style.buttons}>
                        <Link className={style.aaa2}
                              to="/docs/start/">
                            Get started
                        </Link>
                        <Link className={style.aaa2}
                              to="/docs/docs/">
                            Read the docs
                        </Link>
                        <Link className={style.aaa2}
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
