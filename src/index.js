import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {Login} from "./components/login";
import SignUp from "./components/signup";
import NotFound from "./components/notfound";
import BucketList from "./components/bucketlist";
import Item from "./components/item";

function App() {
    return (
        <Router>
            <Switch>
	    		<Route exact path='/' component={Login} />
	    		<Route exact path='/signup' component={SignUp} />
	    		<Route exact path='/bucketlist' component={BucketList} />
	    		<Route exact path='/item' component={Item} />
	    		<Route path='' component={NotFound} />
			</Switch>
        </Router>
    )
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
)