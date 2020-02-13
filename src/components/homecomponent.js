import React from 'react';
import {Link} from "react-router-dom";
import "../css/index.css";

function NavComponent() {
	return (
		<nav className="navbar navbar-expand-md bg-dark navbar-dark pt-1 pb-1">
			<div>
				<div className="navbar-brand">
					<Link to="/" className="text-white text-decoration-none">
						The Currency Converter
					</Link>
				</div>
			</div>
		</nav>
	)
}

function Intronote() {
	return (
		<section className="container-fluid text-center mt-5">
			<div><p>Welcome to the Currency Converter.</p></div>
			<div><p>Here you can convert from any currency of any country to another. There are a few rules though.</p></div>
			<div><p>You can only make two conversions per request.</p></div>
			<div><p>You can only make a maximum of 100 conversions per hour.</p></div>

			<div>
				<button type="button" className="btn btn-secondary text-white">
					<Link to="/converter" className="text-white text-decoration-none">Get Started</Link>
				</button>
			</div>
		</section>
	)
}

class Home extends React.Component {
	render() {
		return (
			<article>
				<NavComponent />
				<Intronote />
			</article>
		)
	}
}

export {Home, NavComponent};