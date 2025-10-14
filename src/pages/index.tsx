import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import '../css/custom.css'

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <div className="home">
            <header className="title">
                <h1 className="mainTitle">Welcome to Radix</h1>
                <h2>
                    Radix makes your app develop
                </h2>
            </header>
            <main className="home-content">
                <HomepageFeatures/>
                <p>You provide your code and a Dockerfile to build
                    it, and Radix will take it from there.
                </p>
                <div className="home-buttons-container">
                    <Link
                        to="/start/">
                        Get started
                    </Link>
                    <Link
                        to="/docs/">
                        Read the docs
                    </Link>
                    <Link
                        to="/community/">
                        Our community
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default function Home(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title="Welcome"
            description="Description will go into a meta tag in <head />">
            <HomepageHeader/>
        </Layout>
    );
}
