import React from 'react';
import "../css/index.css";
import {NavComponent} from "./homecomponent"
import Loader from 'react-loaders'

function ShowLoader() {
	return <div><img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif" /></div>
	//
}

class Converter extends React.Component {
	constructor() {
		super()

		this.state = {
			amount: "",
			currencyfrom: "NGN",
			currencyto: "USD",
			conversionvalue: "",
			conversionrate: "",
			loading: false
		}

		this.handleInput = this.handleInput.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();

		//https://free.currconv.com/api/v7/convert?q=USD_PHP&compact=ultra&apiKey=89af65d6a26d24bf5019

		let query = this.state.currencyfrom+"_"+this.state.currencyto;
		let proxyUrl = 'https://calm-spire-67840.herokuapp.com/'
		let url = "https://free.currconv.com/api/v7/convert?q=" + query + "&compact=ultra&apiKey=89af65d6a26d24bf5019";

		if(!this.state.amount) {
			alert("Please enter amount.")
			return this.handleNotifications
		}
		else if (!this.state.currencyfrom) {
			console.log("No currencyfrom selected!");
		}
		else if(!this.state.currencyto) {
			console.log("No currencyto selected!");
		}
		else {

			this.setState({ loading: true }, () => {
				fetch(proxyUrl + url)
					.then((response) => {
						return response.json();
					})
					.then((data) => {
						this.setState({loading: false});
						console.log("data: ", data[query]);

						this.setState({
							conversionvalue: (data[query]*this.state.amount),
							conversionrate: (data[query])
						})
					})
					.catch((error) => {
						console.log("error: ", error.message);
					}) 
				})
			}
	};

	handleInput(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	render() {
		return (
			<section className="text-center">
				<NavComponent />

				<div className="cv-bd">
					<div className="mt-5">
					<header>How does it work?</header>
					<div><p>Enter the amount you want to convert into the form.</p></div>
					<div><p>Then select the currencies you want to convert from and to.</p></div>
					<div><p>Then press convert!</p></div>
				</div>
				
				<div className="row text-center container-fluid cent">
					<div className="col mx-auto w-50">
						<input onChange={this.handleInput} value={this.state.amount} type="number" 
						className="form-control mr-sm-2 mb-5" id="num"
						placeholder="Enter amount to convert..." name="amount"/>
					</div>

				</div>

				<div className="row container-fluid mb-4 cent">

					<div className="col-md-4">
						<div className="form-group">
							<select onChange={this.handleInput} value={this.state.currencyfrom} className="form-control" id="sel1" name="currencyfrom">
								<option disabled>Select a currency</option>
		                        <option value="AED" >AED</option>
		                        <option value="AFN" >AFN</option>
		                        <option value="ALL" >ALL</option>
		                        <option value="AMD" >AMD</option>
		                        <option value="ANG" >ANG</option>
		                        <option value="AOA" >AOA</option>
		                        <option value="ARS" >ARS</option>
		                        <option value="AUD" >AUD</option>
		                        <option value="AWG" >AWG</option>
		                        <option value="AZN" >AZN</option>
		                        <option value="BAM" >BAM</option>
		                        <option value="BBD" >BBD</option>
		                        <option value="BDT" >BDT</option>
		                        <option value="BGN" >BGN</option>
		                        <option value="BHD" >BHD</option>
		                        <option value="BIF" >BIF</option>
		                        <option value="BND" >BND</option>
		                        <option value="BOB" >BOB</option>
		                        <option value="BRL" >BRL</option>
		                        <option value="BSD" >BSD</option>
		                        <option value="BTC" >BTC</option>
		                        <option value="BTN" >BTN</option>
		                        <option value="BWP" >BWP</option>
		                        <option value="BYN" >BYN</option>
		                        <option value="BYR" >BYR</option>
		                        <option value="BZD" >BZD</option>
		                        <option value="CAD" >CAD</option>
		                        <option value="CDF" >CDF</option>
		                        <option value="CHF" >CHF</option>
		                        <option value="CLP" >CLP</option>
		                        <option value="CNY" >CNY</option>
		                        <option value="COP" >COP</option>
		                        <option value="CRC" >CRC</option>
		                        <option value="CUP" >CUP</option>
		                        <option value="CVE" >CVE</option>
		                        <option value="CZK" >CZK</option>
		                        <option value="DJF" >DJF</option>
		                        <option value="DKK" >DKK</option>
		                        <option value="DOP" >DOP</option>
		                        <option value="DZD" >DZD</option>
		                        <option value="EGP" >EGP</option>
		                        <option value="ERN" >ERN</option>
		                        <option value="ETB" >ETB</option>
		                        <option value="EUR" >EUR</option>
		                        <option value="FJD" >FJD</option>
		                        <option value="FKP" >FKP</option>
		                        <option value="GBP" >GBP</option>
		                        <option value="GEL" >GEL</option>
		                        <option value="GHS" >GHS</option>
		                        <option value="GIP" >GIP</option>
		                        <option value="GMD" >GMD</option>
		                        <option value="GNF" >GNF</option>
		                        <option value="GTQ" >GTQ</option>
		                        <option value="GYD" >GYD</option>
		                        <option value="HKD" >HKD</option>
		                        <option value="HNL" >HNL</option>
		                        <option value="HRK" >HRK</option>
		                        <option value="HTG" >HTG</option>
		                        <option value="HUF" >HUF</option>
		                        <option value="IDR" >IDR</option>
		                        <option value="ILS" >ILS</option>
		                        <option value="INR" >INR</option>
		                        <option value="IQD" >IQD</option>
		                        <option value="IRR" >IRR</option>
		                        <option value="ISK" >ISK</option>
		                        <option value="JMD" >JMD</option>
		                        <option value="JOD" >JOD</option>
		                        <option value="JPY" >JPY</option>
		                        <option value="KES" >KES</option>
		                        <option value="KGS" >KGS</option>
		                        <option value="KHR" >KHR</option>
		                        <option value="KMF" >KMF</option>
		                        <option value="KPW" >KPW</option>
		                        <option value="KRW" >KRW</option>
		                        <option value="KWD" >KWD</option>
		                        <option value="KYD" >KYD</option>
		                        <option value="KZT" >KZT</option>
		                        <option value="LAK" >LAK</option>
		                        <option value="LBP" >LBP</option>
		                        <option value="LKR" >LKR</option>
		                        <option value="LRD" >LRD</option>
		                        <option value="LSL" >LSL</option>
		                        <option value="LVL" >LVL</option>
		                        <option value="LYD" >LYD</option>
		                        <option value="MAD" >MAD</option>
		                        <option value="MDL" >MDL</option>
		                        <option value="MGA" >MGA</option>
		                        <option value="MKD" >MKD</option>
		                        <option value="MMK" >MMK</option>
		                        <option value="MNT" >MNT</option>
		                        <option value="MOP" >MOP</option>
		                        <option value="MRO" >MRO</option>
		                        <option value="MUR" >MUR</option>
		                        <option value="MVR" >MVR</option>
		                        <option value="MWK" >MWK</option>
		                        <option value="MXN" >MXN</option>
		                        <option value="MYR" >MYR</option>
		                        <option value="MZN" >MZN</option>
		                        <option value="NAD" >NAD</option>
		                        <option value="NGN">NGN</option>
		                        <option value="NIO" >NIO</option>
		                        <option value="NOK" >NOK</option>
		                        <option value="NPR" >NPR</option>
		                        <option value="NZD" >NZD</option>
		                        <option value="OMR" >OMR</option>
		                        <option value="PAB" >PAB</option>
		                        <option value="PEN" >PEN</option>
		                        <option value="PGK" >PGK</option>
		                        <option value="PHP" >PHP</option>
		                        <option value="PKR" >PKR</option>
		                        <option value="PLN" >PLN</option>
		                        <option value="PYG" >PYG</option>
		                        <option value="QAR" >QAR</option>
		                        <option value="RON" >RON</option>
		                        <option value="RSD" >RSD</option>
		                        <option value="RUB" >RUB</option>
		                        <option value="RWF" >RWF</option>
		                        <option value="SAR" >SAR</option>
		                        <option value="SBD" >SBD</option>
		                        <option value="SCR" >SCR</option>
		                        <option value="SDG" >SDG</option>
		                        <option value="SEK" >SEK</option>
		                        <option value="SGD" >SGD</option>
		                        <option value="SHP" >SHP</option>
		                        <option value="SLL" >SLL</option>
		                        <option value="SOS" >SOS</option>
		                        <option value="SRD" >SRD</option>
		                        <option value="STD" >STD</option>
		                        <option value="SYP" >SYP</option>
		                        <option value="SZL" >SZL</option>
		                        <option value="THB" >THB</option>
		                        <option value="TJS" >TJS</option>
		                        <option value="TMT" >TMT</option>
		                        <option value="TND" >TND</option>
		                        <option value="TOP" >TOP</option>
		                        <option value="TRY" >TRY</option>
		                        <option value="TTD" >TTD</option>
		                        <option value="TWD" >TWD</option>
		                        <option value="TZS" >TZS</option>
		                        <option value="UAH" >UAH</option>
		                        <option value="UGX" >UGX</option>
		                        <option value="USD">USD</option>
		                        <option value="UYU" >UYU</option>
		                        <option value="UZS" >UZS</option>
		                        <option value="VEF" >VEF</option>
		                        <option value="VND" >VND</option>
		                        <option value="VUV" >VUV</option>
		                        <option value="WST" >WST</option>
		                        <option value="XAF" >XAF</option>
		                        <option value="XCD" >XCD</option>
		                        <option value="XDR" >XDR</option>
		                        <option value="XOF" >XOF</option>
		                        <option value="XPF" >XPF</option>
		                        <option value="YER" >YER</option>
		                        <option value="ZAR" >ZAR</option>
		                        <option value="ZMW" >ZMW</option>
							</select>
						</div>
					</div>

					<div className="col-md-4 pb-3 "><div>To</div></div>

					<div className="col-md-4">
						<div className="form-group">
							<select onChange={this.handleInput} value={this.state.currencyto} className="form-control" id="sel2" name="currencyto">
								<option disabled value="">Select a currency</option>
		                        <option value="AED" >AED</option>
		                        <option value="AFN" >AFN</option>
		                        <option value="ALL" >ALL</option>
		                        <option value="AMD" >AMD</option>
		                        <option value="ANG" >ANG</option>
		                        <option value="AOA" >AOA</option>
		                        <option value="ARS" >ARS</option>
		                        <option value="AUD" >AUD</option>
		                        <option value="AWG" >AWG</option>
		                        <option value="AZN" >AZN</option>
		                        <option value="BAM" >BAM</option>
		                        <option value="BBD" >BBD</option>
		                        <option value="BDT" >BDT</option>
		                        <option value="BGN" >BGN</option>
		                        <option value="BHD" >BHD</option>
		                        <option value="BIF" >BIF</option>
		                        <option value="BND" >BND</option>
		                        <option value="BOB" >BOB</option>
		                        <option value="BRL" >BRL</option>
		                        <option value="BSD" >BSD</option>
		                        <option value="BTC" >BTC</option>
		                        <option value="BTN" >BTN</option>
		                        <option value="BWP" >BWP</option>
		                        <option value="BYN" >BYN</option>
		                        <option value="BYR" >BYR</option>
		                        <option value="BZD" >BZD</option>
		                        <option value="CAD" >CAD</option>
		                        <option value="CDF" >CDF</option>
		                        <option value="CHF" >CHF</option>
		                        <option value="CLP" >CLP</option>
		                        <option value="CNY" >CNY</option>
		                        <option value="COP" >COP</option>
		                        <option value="CRC" >CRC</option>
		                        <option value="CUP" >CUP</option>
		                        <option value="CVE" >CVE</option>
		                        <option value="CZK" >CZK</option>
		                        <option value="DJF" >DJF</option>
		                        <option value="DKK" >DKK</option>
		                        <option value="DOP" >DOP</option>
		                        <option value="DZD" >DZD</option>
		                        <option value="EGP" >EGP</option>
		                        <option value="ERN" >ERN</option>
		                        <option value="ETB" >ETB</option>
		                        <option value="EUR" >EUR</option>
		                        <option value="FJD" >FJD</option>
		                        <option value="FKP" >FKP</option>
		                        <option value="GBP" >GBP</option>
		                        <option value="GEL" >GEL</option>
		                        <option value="GHS" >GHS</option>
		                        <option value="GIP" >GIP</option>
		                        <option value="GMD" >GMD</option>
		                        <option value="GNF" >GNF</option>
		                        <option value="GTQ" >GTQ</option>
		                        <option value="GYD" >GYD</option>
		                        <option value="HKD" >HKD</option>
		                        <option value="HNL" >HNL</option>
		                        <option value="HRK" >HRK</option>
		                        <option value="HTG" >HTG</option>
		                        <option value="HUF" >HUF</option>
		                        <option value="IDR" >IDR</option>
		                        <option value="ILS" >ILS</option>
		                        <option value="INR" >INR</option>
		                        <option value="IQD" >IQD</option>
		                        <option value="IRR" >IRR</option>
		                        <option value="ISK" >ISK</option>
		                        <option value="JMD" >JMD</option>
		                        <option value="JOD" >JOD</option>
		                        <option value="JPY" >JPY</option>
		                        <option value="KES" >KES</option>
		                        <option value="KGS" >KGS</option>
		                        <option value="KHR" >KHR</option>
		                        <option value="KMF" >KMF</option>
		                        <option value="KPW" >KPW</option>
		                        <option value="KRW" >KRW</option>
		                        <option value="KWD" >KWD</option>
		                        <option value="KYD" >KYD</option>
		                        <option value="KZT" >KZT</option>
		                        <option value="LAK" >LAK</option>
		                        <option value="LBP" >LBP</option>
		                        <option value="LKR" >LKR</option>
		                        <option value="LRD" >LRD</option>
		                        <option value="LSL" >LSL</option>
		                        <option value="LVL" >LVL</option>
		                        <option value="LYD" >LYD</option>
		                        <option value="MAD" >MAD</option>
		                        <option value="MDL" >MDL</option>
		                        <option value="MGA" >MGA</option>
		                        <option value="MKD" >MKD</option>
		                        <option value="MMK" >MMK</option>
		                        <option value="MNT" >MNT</option>
		                        <option value="MOP" >MOP</option>
		                        <option value="MRO" >MRO</option>
		                        <option value="MUR" >MUR</option>
		                        <option value="MVR" >MVR</option>
		                        <option value="MWK" >MWK</option>
		                        <option value="MXN" >MXN</option>
		                        <option value="MYR" >MYR</option>
		                        <option value="MZN" >MZN</option>
		                        <option value="NAD" >NAD</option>
		                        <option value="NGN" >NGN</option>
		                        <option value="NIO" >NIO</option>
		                        <option value="NOK" >NOK</option>
		                        <option value="NPR" >NPR</option>
		                        <option value="NZD" >NZD</option>
		                        <option value="OMR" >OMR</option>
		                        <option value="PAB" >PAB</option>
		                        <option value="PEN" >PEN</option>
		                        <option value="PGK" >PGK</option>
		                        <option value="PHP">PHP</option>
		                        <option value="PKR" >PKR</option>
		                        <option value="PLN" >PLN</option>
		                        <option value="PYG" >PYG</option>
		                        <option value="QAR" >QAR</option>
		                        <option value="RON" >RON</option>
		                        <option value="RSD" >RSD</option>
		                        <option value="RUB" >RUB</option>
		                        <option value="RWF" >RWF</option>
		                        <option value="SAR" >SAR</option>
		                        <option value="SBD" >SBD</option>
		                        <option value="SCR" >SCR</option>
		                        <option value="SDG" >SDG</option>
		                        <option value="SEK" >SEK</option>
		                        <option value="SGD" >SGD</option>
		                        <option value="SHP" >SHP</option>
		                        <option value="SLL" >SLL</option>
		                        <option value="SOS" >SOS</option>
		                        <option value="SRD" >SRD</option>
		                        <option value="STD" >STD</option>
		                        <option value="SYP" >SYP</option>
		                        <option value="SZL" >SZL</option>
		                        <option value="THB" >THB</option>
		                        <option value="TJS" >TJS</option>
		                        <option value="TMT" >TMT</option>
		                        <option value="TND" >TND</option>
		                        <option value="TOP" >TOP</option>
		                        <option value="TRY" >TRY</option>
		                        <option value="TTD" >TTD</option>
		                        <option value="TWD" >TWD</option>
		                        <option value="TZS" >TZS</option>
		                        <option value="UAH" >UAH</option>
		                        <option value="UGX" >UGX</option>
		                        <option value="USD">USD</option>
		                        <option value="UYU" >UYU</option>
		                        <option value="UZS" >UZS</option>
		                        <option value="VEF" >VEF</option>
		                        <option value="VND" >VND</option>
		                        <option value="VUV" >VUV</option>
		                        <option value="WST" >WST</option>
		                        <option value="XAF" >XAF</option>
		                        <option value="XCD" >XCD</option>
		                        <option value="XDR" >XDR</option>
		                        <option value="XOF" >XOF</option>
		                        <option value="XPF" >XPF</option>
		                        <option value="YER" >YER</option>
		                        <option value="ZAR" >ZAR</option>
		                        <option value="ZMW" >ZMW</option>
							</select>
						</div>
					</div>
				</div>

					<div className="text-center container-fluid">

						<div className="mx-auto w-50">
							<button type="button" className="btn btn-secondary text-white" onClick={this.handleSubmit}>
								Submit
							</button>
						</div>
					</div>

					{this.state.loading ? <ShowLoader /> : 
					<div>
						<div className="col mx-auto w-50 rst" style={{paddingTop: "2rem"}}>
							<span>Convertion rate is: </span>
							<input value={Number(this.state.conversionrate).toFixed(4) + " per " + this.state.currencyto} type="text" 
							className="form-control mr-sm-2 mb-5" id="num"
							name="result" readOnly/>
						</div>

						<div className="col mx-auto w-50">
							<span>Convertion value is: </span>
							<input value={this.state.currencyto + Number(this.state.conversionvalue).toFixed(3)} type="text" 
							className="form-control mr-sm-2 mb-5" id="num"
							name="result" readOnly/>
						</div>
					</div>}
				</div>

			</section>
		)
	}

	componentDidMount() {
        //this.$f7ready((f7) => {});
        console.log("component mounted!");
        //$$('.toast').toast('show');
    }
}

export default Converter;