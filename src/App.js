import React, {useEffect, useState} from "react";
import {v4 as uuidv4} from 'uuid';

const URL = process.env.REACT_APP_SERVER_ADDRESS||'ws://127.0.0.1:8999';
const userID = uuidv4();
const App = () => {
	const [userName, setUserName] = useState('Alice');
	const [rankedLevel, setRankedLevel] = useState(100);
	const [workFlow, setWorkFlow] = useState(0);
	const [messages, setMessages] = useState([]);
	const [ws, setWs] = useState(new WebSocket(URL));


	const handleFormSubmit = (e) => {
		e.preventDefault();
		const type = workFlow !== 1 ? "Play" : "Leave";
		const data = {
			type,
			user: {
				id: userID,
				rankedLevel,
				name: userName
			},
		};
		ws.send(JSON.stringify(data));
	}

	useEffect(() => {
		ws.onopen = (e) => {
			console.log("open connection")

		}

		ws.onmessage = (e) => {
			console.log(e)
			const dataFromServer = JSON.parse(e.data);
			if (dataFromServer.type === "Connection") {
				setWorkFlow(0);
				setMessages([dataFromServer.message, ...messages]);
			} else if (dataFromServer.type === "Search") {
				setWorkFlow(1);
				setMessages([dataFromServer.message, ...messages]);
			} else if (dataFromServer.type === "Match") {
				setWorkFlow(2);
				const matchMessage = `${dataFromServer.message} against ${dataFromServer.opponentPlayer.name} (RankedLevel: ${dataFromServer.opponentPlayer.rankedLevel})`
				setMessages([matchMessage, ...messages]);
			} else if (dataFromServer.type === "Leave") {
				setWorkFlow(3);
				setMessages([dataFromServer.message, ...messages]);
			}else if (dataFromServer.type === "NotFound"){
				setWorkFlow(4);
				setMessages([dataFromServer.message, ...messages]);
			}
				console.log(dataFromServer);
		}

		return () => {
			ws.onclose = () => {
				console.log('WebSocket Disconnected');
				setWs(new WebSocket(URL));
			}
		}
	}, [ws.onmessage, ws.onopen, ws.onclose, messages,ws]);

	const renderUserForm = () => {
		const disableInput = workFlow === 1
		return (
			<form
				className="row g-3"
				action=""
				onSubmit={handleFormSubmit}
			>
				<div className="col-md-6">

					<label htmlFor="rankedLevel">
						User Name
					</label>
					<input
						type="text"
						id="user"
						className="form-control"
						placeholder="User Name"
						value={userName}
						disabled={disableInput}
						onChange={e => setUserName(e.target.value)}
					/>
				</div>
				<div className="col-md-6">

					<label htmlFor="rankedLevel">
						Ranked Level
					</label>
					<input
						type="number"
						id="user"
						placeholder="User"
						className="form-control"
						value={rankedLevel}
						disabled={disableInput}
						onChange={e => setRankedLevel(e.target.value)}
					/>
				</div>
				<div className="d-grid gap-2 col-6 mx-auto">
					<button type="submit" className={`btn btn-${workFlow !== 1 ? "primary":"warning"}`}>{workFlow !== 1 ? "Play" : "Cancel"}</button>
				</div>
			</form>
		);
	}

	const renderLogs = () => {
		return (
			<ul>
				{messages.reverse().map((message, index) =>
					<li key={index}>
						<b>{message}</b>
					</li>
				)}
			</ul>
		);
	}


	return (
		<div className="container mt-3">
			<h1 className="text-center">MatchMaking</h1>
			<div className="card">
				<h4 className="card-header">
					User info
				</h4>
				<div className="card-body">
					{renderUserForm()}
				</div>
			</div>
			<div className="card mt-3">
				<h4 className="card-header">
					Logs {}
					<button onClick={() => setMessages([])} type="button" className="btn btn-primary">Clear logs</button>
				</h4>
				<div className="card-body">
					{renderLogs()}
				</div>
			</div>

		</div>
	)
}

export default App;
