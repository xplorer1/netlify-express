import React from 'react';
import {Link} from "react-router-dom";
import HttpService from '../httpservice';
import store from "store";
import {Utilities} from './login';

class BucketList extends React.Component {
	constructor() {
        super();

        this.state = {
            ajaxcalled: false,
            ajaxcalled2: false,
            ajaxcalled3: false,
            pageloading: true,
            listofbuckets: [],
            activebucket: {},
            name: "",

            bucketname: "",
            itemname: "",
            targetbucket: "",
            done: false,

            listview: true,
            listofitems: [],
            editname: "",
            editid: "",

            edititemname: "", 
            editdone: "",
            itemsarrived: false,

            activeitem: {},
            activecard: ""
        }
    }

    handleInput = (e) => {

        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleSignOut = () => {
        let token = store.get("token");

        if(token) {
            HttpService.TokenServiceGetNoJson("auth/logout", token)
                .then((response) => {
                    if(response.status === 200) {
                        store.remove("token");
                        store.remove("userdata");

                        this.props.history.push("/");
                    }
                    else if(response.status === 401) {
                        store.remove("token");
                        store.remove("userdata");
                        store.remove("buckets");
                        store.remove("item");

                        this.props.history.push("/");
                    }
                })
                .catch((error) => {
                    Utilities.Notify("Unable to sign out at this time. Please try again later.", "info");
                })
        }
        else {
            this.props.history.push("/");
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        if(!this.state.bucketname) {
            Utilities.Notify("Please enter the bucket name.", "error");
        }
        else {

            this.setState({ajaxcalled: true});

            let data = {
            	name: this.state.bucketname
            }

            let token = store.get("token");

            if(!token) {
                this.handleSignOut();
            }

            HttpService.TokenServicePost(data, "bucketlists", token, "POST")
                .then((response) => {
                    this.setState({ajaxcalled: false});

                    if(response.status === 200) {
                        Utilities.Notify("Bucket added successfully.", "success");

                        let newlist = this.state.listofbuckets.concat(response.data);

                        this.setState({listofbuckets: newlist});
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);

                    Utilities.Notify("Unable to login at this time. Please try again later.", "info");
                    this.setState({ajaxcalled: false})
                })
        }
    }

    handleEditBucket = (e) => {
        e.preventDefault();

        this.setState({ajaxcalled: true});

        let data = {
            name: this.state.editname || this.state.bucketname
        }

        let token = store.get("token");

        if(!token) {
            this.handleSignOut();
        }

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activebucket.id, token, "PUT")
            .then((response) => {
                this.setState({ajaxcalled: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");

                    this.setState({activebucket: response.data[0]});
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Could not complete your request. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    handleDeleteBucket = (e) => {
        e.preventDefault();

        this.setState({ajaxcalled3: true});

        let data = {
            name: this.state.editname || this.state.bucketname
        }

        let token = store.get("token");

        if(!token) {
            this.handleSignOut();
        }

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activebucket.id, token, "DELETE")
            .then((response) => {
                this.setState({ajaxcalled3: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");

                    let oldlist = this.state.listofbuckets;

                    let newlist = oldlist.filter((list) => {
                        return list.id !== this.state.activebucket.id
                    });

                    this.setState({listofbuckets: newlist, listview: true});
                }
                else if(response.status === 401) {
                    this.handleSignOut();
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Could not complete your request. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    handleAddItem = (e) => {
        e.preventDefault();

        if(!this.state.itemname) {
            Utilities.Notify("Please enter the bucket name.", "error");
        }
        else if(!this.state.targetbucket) {
            Utilities.Notify("Please select a bucket.", "error");
        }
        else {

            this.setState({ajaxcalled: true});

            let data = {
                name: this.state.itemname,
                done: this.state.done
            }

            console.log("da: ", data);

            let token = store.get("token");

            if(!token) {
                this.handleSignOut();
            }

            HttpService.TokenServicePost(data, "bucketlists/" + this.state.targetbucket + "/items", token, "POST")
                .then((response) => {
                    this.setState({ajaxcalled: false});
                    console.log("response: ", response);

                    if(response.status === 200) {
                        Utilities.Notify("Item added successfully.", "success");

                        //let newlist = this.state.listofbuckets.concat(response.data);

                        //this.setState({listofbuckets: newlist});
                    }
                    else {
                         Utilities.Notify("Unable to add item.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);

                    Utilities.Notify("Unable to login at this time. Please try again later.", "info");
                    this.setState({ajaxcalled: false})
                })
        }
    }

    handleCheck = (e) => {

        this.setState({
            [e.target.name]: e.target.checked
        });
    }

    handleViewItems = (id, name) => {
        let token = store.get("token");
        if(id) {

            this.setState({
                ajaxcalled2: true, 
                editid: id, 
                editname: name
            });

            HttpService.TokenServiceGet("bucketlists/" + id + "/items", token)
                .then((response) => {

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }

                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }

                    else if(response.status === 200) {
                        this.setState({
                            ajaxcalled2: false,
                            listofitems: response.data,
                            itemsarrived: true
                        })
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
    }

    fetchbucket = (id, name) => {
        let token = store.get("token");
        if(id) {

            this.setState({
                pageloading: true
            });

            HttpService.TokenServiceGet("bucketlists/" + id, token)
                .then((response) => {
                    console.log("res: ", response);

                    this.setState({pageloading: false});

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }

                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }

                    else if(response.status === 200) {
                        this.setState({
                            activebucket: response.data[0],
                            listview: false
                        })
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
    }

    fetchItem = (id, bucketid) => {

        let token = store.get("token");
        if(id && bucketid) {

            this.setState({
                ajaxcalled2: true
            });

            HttpService.TokenServiceGet("bucketlists/" + bucketid + "/items/" + id, token)
                .then((response) => {
                    this.setState({activeitem: {}, activeitemclass: "hide", ajaxcalled2: false});

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }

                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }

                    else if(response.status === 200) {
                        store.set("item", response.data[0]);

                        this.props.history.push("/item");
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
    }

    handleEditItem = (e) => {
        e.preventDefault();

        this.setState({ajaxcalled: true});

        let data = {
            name: this.state.edititemname || this.state.itemname,
            done: this.state.editdone || this.state.done
        }

        let token = store.get("token");

        if(!token) {
            this.handleSignOut();
        }

        HttpService.TokenServicePost(data, "bucketlists/" + this.state.activeitem.bucketid + "/items" + this.state.activeitem.item, token, "PUT")
            .then((response) => {
                this.setState({ajaxcalled: false});

                if(response.status === 200) {
                    Utilities.Notify("Operations was successful.", "success");

                    this.setState({listofitems: response.data});
                }
            })
            .catch((error) => {
                console.log("error: ", error);

                Utilities.Notify("Could not complete your request. Please try again later.", "info");
                this.setState({ajaxcalled: false})
            })
    }

    signOut = () => {
        return (<a className="navbar-brand cp" onClick={this.handleSignOut}>Sign Out</a>)
    }

	render() {
		return (
			<article>
                <Utilities.NavBar name={this.state.name} signOut={this.signOut()} />
                {
                    this.state.listview ?
                        <div className="container-fluid">
                            <div className="row mb-3">
                                <div className="col-6 text-left">
                                    <div className="">
                                        <button type="button" className={"btn btn-primary tradebg rounded"} data-toggle="modal" data-target="#addbucketmodal">
                                            Add Bucket
                                        </button>
                                    </div>
                                </div>

                                <div className="col-6 text-right">
                                    <div className="">
                                        <button type="button" className={"btn btn-primary tradebg rounded"} data-toggle="modal" data-target="#additemmodal">
                                            Add Item
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">

                                <table className="w-100 text-center table table-hover">
                                    <thead style={{background: "#dddddd"}}>
                                        <tr>
                                            <th>Name</th>
                                            <th>Date Created</th>
                                            <th>Date Modified</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            this.state.listofbuckets.map((list) => {
                                                return (
                                                    <tr className="cp" key={list.id} onClick={() => this.fetchbucket(list.id)}>
                                                        <td className="text-center">{list.name}</td>
                                                        <td className="text-center">{new Date(list.date_created).toLocaleString()}</td>
                                                        <td className="text-center">{new Date(list.date_modified).toLocaleString()}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                                        :
                        <div className="container-fluid">
                            <div className="row d-flex intro mb-3 p-2 mx-0 bg-light">
                                <div className="text-left cp p-0" onClick={()=> {this.setState({listview: true, itemsarrived: false})}}>
                                    <button type="button" className={"btn btn-outline-primary tradebg rounded border-0"}>
                                        Back
                                    </button>
                                </div>
                            </div>

                            <div className="w-100 text-left">
                                <div className="row d-flex intro mb-3 p-2 mx-0 bg-light">
                                    <div className="col text-left" style={{lineHeight: "2.5"}}>Bucket Details</div>

                                    <div className="col text-right cp p-0" onClick={()=> {this.handleViewItems(this.state.activebucket.id, this.state.activebucket.name)}}>
                                        <button type="button" className={"btn btn-primary tradebg rounded"}>
                                            View Items
                                            {this.state.ajaxcalled2 ? Utilities.Indicator() : <div></div>}
                                        </button>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-3 text-muted small">Name:</div>
                                    <div className="col text-muted ft14">{this.state.activebucket.name}</div>
                                </div>

                                <div className="row">
                                    <div className="col-3 text-muted small">Date Created:</div>
                                    <div className="col text-muted ft14">{new Date(this.state.activebucket.date_created).toLocaleString()}</div>
                                </div>

                                <div className="row">
                                    <div className="col-3 text-muted small">Date Modified:</div>
                                    <div className="col text-muted ft14">{new Date(this.state.activebucket.date_modified).toLocaleString()}</div>
                                </div>

                                <div className="row">
                                    <div className="col-3 text-muted small">Created by(ID):</div>
                                    <div className="col text-muted ft14">{this.state.activebucket.created_by}</div>
                                </div>

                                <div className="row">
                                    <div className="col-3 text-muted small">Bucket ID</div>
                                    <div className="col text-muted ft14">{this.state.activebucket.created_by}</div>
                                </div>

                                <div className="row my-3">
                                    <div className="col-6 text-left">
                                        <div className="">
                                            <button type="button" className={"btn btn-primary tradebg rounded"} data-toggle="modal" data-target="#editbucketmodal">
                                                Edit Bucket List
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-6 text-right">
                                        <div className="">
                                            <button type="button" className={"btn btn-primary bg-danger text-white rounded border-0"} onClick={this.handleDeleteBucket}>
                                                Delete Bucket List
                                                {this.state.ajaxcalled3 ? Utilities.Indicator() : <div></div>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {
                                this.state.itemsarrived ?
                                    <div>
                                        <div className="card border-0">
                                            <div className="card-header border-0 bg-light">
                                                <div className="row">
                                                    <div className="col">Item Name</div>
                                                    <div className="col">Date Created</div>
                                                    <div className="col">Done</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="accordion">

                                            {
                                                    this.state.listofitems.map((item) => {
                                                        return (
                                                            <div className="list-group list-group-flush" key={item.id} onClick={() => {this.fetchItem(item.id, item.bucket_id, item.name, item.done)}}>
                                                                <a href="#" className="list-group-item list-group-item-action">
                                                                    <div className="row">
                                                                        <div className="col">{item.name}</div>
                                                                        <div className="col">{new Date(item.date_created).toLocaleDateString()}</div>
                                                                        <div className="col">{item.done ? "Yes" : "No"}</div>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        )
                                                    }) 
                                                }
                                        </div>
                                    </div>
                                :
                                <div></div>
                            }
                        </div>
                }

                <div className="modal fade" id="addbucketmodal">
                    <div className="modal-dialog mw-100 modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header border-0 text-center">

                                <div className="modal-title font-weight-bold">New Bucket</div>
                                <button type="button" className="close cl-times" data-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body py-0 w-100 mx-auto">
                                <div className="form-group">
                                    <label htmlFor="bucketname" className="small">Name</label>
                                    <input onChange={this.handleInput} value={this.state.bucketname} name="bucketname" type="text" className="form-control" id="symbol" placeholder="Bucket Name" />
                                </div>
                            </div>

                            <div className="modal-footer mx-auto border-top-0 pb-4">
                                <button type="button" className="btn btn-primary px-5" onClick={this.handleSubmit}>
                                    Add
                                    {this.state.ajaxcalled ? Utilities.Indicator() : <div></div>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="editbucketmodal">
                    <div className="modal-dialog mw-100 modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header border-0 text-center">

                                <div className="modal-title font-weight-bold">Edit this bucket list? Enter a new name.</div>
                                <button type="button" className="close cl-times" data-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body py-0 w-100 mx-auto">
                                <div className="form-group">
                                    <label htmlFor="bucketname" className="small">Name</label>
                                    <input onChange={this.handleInput} value={this.state.editname} name="editname" type="text" className="form-control" id="symbol" placeholder="Bucket Name" />
                                </div>
                            </div>

                            <div className="modal-footer mx-auto border-top-0 pb-4">
                                <button type="button" className="btn btn-primary px-5" onClick={this.handleEditBucket}>
                                    Update
                                    {this.state.ajaxcalled ? Utilities.Indicator() : <div></div>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="additemmodal">
                    <div className="modal-dialog mw-100 modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header border-0 text-center">

                                <div className="modal-title font-weight-bold">New Item</div>
                                <button type="button" className="close cl-times" data-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body py-0 w-100 mx-auto">
                                <div className="form-group">
                                    <label htmlFor="itemname" className="small">Name</label>
                                    <input onChange={this.handleInput} value={this.state.itemname} name="itemname" type="text" className="form-control" id="symbol" placeholder="Item Name" />
                                </div>

                                <div className="">
                                    <select onChange={this.handleInput} 
                                            value={this.state.targetbucket} 
                                            name="targetbucket"
                                            className="form-control mb-3" 
                                            id="exampleFormControlSelect1"
                                        >
                                        <option value="" isdisabled="true">Select a bucket</option>
                                        {
                                            this.state.listofbuckets.map(list => {
                                                return (
                                                    <option key={list.id} value={list.id}>{list.name}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>

                                <div className="custom-control custom-switch">
                                    <input type="checkbox" className="custom-control-input" id="itemdone" 
                                        value={this.state.done} onChange={this.handleCheck} 
                                        name="done" />
                                    <label className="custom-control-label" htmlFor="itemdone">Done?</label>
                                </div>
                            </div>

                            <div className="modal-footer mx-auto border-top-0 pb-4">
                                <button type="button" className="btn btn-primary px-5" onClick={this.handleAddItem}>
                                    Add Item
                                    {this.state.ajaxcalled ? Utilities.Indicator() : <div></div>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="modal fade" id="edititemmodal">
                    <div className="modal-dialog mw-100 modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header border-0 text-center">

                                <div className="modal-title font-weight-bold">Edit Item</div>
                                <button type="button" className="close cl-times" data-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body py-0 w-100 mx-auto">
                                <div className="form-group">
                                    <label htmlFor="itemname" className="small">Name</label>
                                    <input onChange={this.handleInput} value={this.state.edititemname} name="edititemname" type="text" className="form-control" id="symbol" placeholder="Item Name" />
                                </div>

                                <div className="custom-control custom-switch">
                                    <input type="checkbox" className="custom-control-input" id="editdone" 
                                        value={this.state.editdone} onChange={this.handleCheck} 
                                        name="done" />
                                    <label className="custom-control-label" htmlFor="editdone">Done?</label>
                                </div>
                            </div>

                            <div className="modal-footer mx-auto border-top-0 pb-4">
                                <button type="button" className="btn btn-primary px-5" onClick={this.handleEditItem}>
                                    Edit Item
                                    {this.state.ajaxcalled ? Utilities.Indicator() : <div></div>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
			</article>
		)
	}

    componentDidMount() {

        let token = store.get("token");
        let user = store.get("userdata");

        if(token) {
            HttpService.TokenServiceGet("bucketlists", token)
                .then((response) => {

                    this.setState({pageloading: false});

                    if(response.status === 401 || response.status === 403) {

                        this.handleSignOut();
                    }
                    else if(response.status === 500) {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                    else if(response.status === 200) {
                        this.setState({
                            listofbuckets: response.data,
                            name: user.name
                        })

                        store.set("buckets", response.data);
                    }
                    else {
                        Utilities.Notify("Sorry. Unable to reach server. Please try again later.", "info");
                    }
                })
                .catch((error) => {
                    console.log("error: ", error);
                })
        }
        else {
            this.handleSignOut();
        }
    }
}

export default BucketList;