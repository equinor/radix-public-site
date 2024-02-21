import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import './index.module.css';

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <div className="app">
            <main className="home">
                <header className="title">
                    <h1 className="main-title">Welcome to Radix</h1>
                </header>
                <div className="theme-default-content">
                    <div>
                        <div><h1 id="radix-makes-your-app-develop">
                            Radix makes your app develop</h1>
                        </div>
                        <HomepageFeatures/>
                        <p>You provide your code and a Dockerfile to build
                            it, and Radix will take it from there.
                        </p>
                        <div>
                            <Link
                                className="actions-buttons"
                                to="/docs/start/">
                                Get started
                            </Link>
                            <Link
                                className="actions-buttons"
                                to="/docs/docs/">
                                Read the docs
                            </Link>
                            <Link
                                className="actions-buttons"
                                to="/docs/other/">
                                Our community
                            </Link>
                        </div>
                    </div>
                </div>
                <div id="footer"></div>
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
