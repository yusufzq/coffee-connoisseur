import { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
// import Image from 'next/image';
import { ShopContext } from '../contexts/shopContext';
import Banner from '../components/Banner';
import Card from '../components/Card';
import { useLocation } from '../hooks/useLocation';
import { shopsGet } from '../services/shops';
import styles from '../styles/Home.module.css';

export async function getStaticProps() {
	const shops = await shopsGet();

	return {
		props: { shops }
	};
};

function Home({ shops }) {
	const { locate, loading, error: geoLocationError } = useLocation();
	const [ error, setError ] = useState('');
	const { state, dispatch } = useContext(ShopContext);
	const [ locating, setLocating ] = useState(false); 	// DEVELOPMENT

	const { coordinates, shops: nearByShops } = state;
	
	useEffect(() => {
		(async () => {
			try {
				if (coordinates) {
					const response = await fetch(`/api/shops?coordinates=${coordinates}&limit=30`);
					const shops = await response.json();
	
					dispatch({
						type: 'SET_SHOPS',
						payload: shops
					});
				} else {
					// DEVELOPMENT
					const response = await fetch(`/api/shops?coordinates=${process.env.COORDINATES}&limit=30`);
					const shops = await response.json();
	
					dispatch({
						type: 'SET_SHOPS',
						payload: shops
					});
				};
			} catch (error) {
				setError(error.message);
			};
		})();
	}, [coordinates, locating]);

	const onButtonClick = () => {
		locate();
		setLocating(true);
	};
	
	return (
		<div className={styles.container}>
			<Head>
				<meta name='description' content='Generated by CNA' />
				<title>Coffee Connoisseur</title>
				<link rel='icon' type='image/x-icon' href='/favicon.ico' />
			</Head>
			<main className={styles.main}>
				<div className={styles.hero}>
					{/* <Image src='/hero.png' alt='hero' width={700} height={400} /> */}
				</div>
				<Banner buttonText={loading ? 'Locating...' : 'Locate Shops Near Me'} onButtonClick={onButtonClick} />
				{geoLocationError && <pre>Error: {geoLocationError}</pre>}
				{error && <pre>Error: {error}</pre>}
				<div className={styles.sectionWrapper}>
					{nearByShops?.length > 0 && (
						<>
							<h2 className={styles.heading2}>Shops NearBy</h2>
							<section className={styles.cardLayout}>
								{nearByShops.map(({ ID, name, imageURL }) => (
									<Card key={ID} name={name} imageURL={imageURL} href={`/shop/${ID}`} />
								))}
							</section>
						</>
					)}
					{shops?.length > 0 && (
						<>
							<h2 className={styles.heading2}>London Shops</h2>
							<section className={styles.cardLayout}>
								{shops.map(({ ID, name, imageURL }) => (
									<Card key={ID} name={name} imageURL={imageURL} href={`/shop/${ID}`} />
								))}
							</section>
						</>
					)}
				</div>
			</main>
		</div>
	);
};

export default Home;