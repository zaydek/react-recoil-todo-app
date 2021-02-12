import React, { useEffect } from "react"
import { atom, RecoilRoot, selector, useRecoilState, useRecoilValue } from "recoil"

const initialState = {
	done: false,
	text: "",
	todos: [
		// {
		// 	id: "",
		// 	done: false,
		// 	text: "",
		// },
	],
}

const todosAtom = atom({
	key: "todosAtom",
	default: (() => {
		const json = localStorage.getItem("todos-app")
		if (json === null) {
			return initialState
		}
		return JSON.parse(json)
	})(),
})

const todosMetaSelector = selector({
	key: "todosMetaSelector",
	get: ({ get }) => {
		const meta = {
			unchecked: 0,
			checked: 0,
			sum: 0,
		}
		const todos = get(todosAtom).todos
		for (const each of todos) {
			if (!each.done) meta.unchecked++
			if (each.done) meta.checked++
			meta.sum++
		}
		return meta
	},
})

function newID() {
	return Math.random().toString(36).slice(2, 6)
}

const todosReducer = (state, setState) => ({
	setDone(done) {
		setState({ ...state, done })
	},
	setText(text) {
		setState({ ...state, text })
	},
	addTodo() {
		if (state.text === "") {
			// No-op
			return
		}
		const id = newID()
		const { done, text } = state
		const todo = { id, done, text }
		setState({ ...state, done: false, text: "", todos: [todo, ...state.todos] })
	},
	setDoneByID(id, done) {
		const todos = state.todos.map(each => (each.id === id ? { ...each, done } : each))
		setState({ ...state, todos })
	},
	setTextByID(id, text) {
		const todos = state.todos.map(each => (each.id === id ? { ...each, text } : each))
		setState({ ...state, todos })
	},
	removeTodoByID(id) {
		const todos = state.todos.filter(each => each.id !== id)
		setState({ ...state, todos })
	},
})

function App() {
	const [todos, setTodos] = useRecoilState(todosAtom)
	const meta = useRecoilValue(todosMetaSelector)

	const funcs = todosReducer(todos, setTodos)

	useEffect(() => {
		const id = setTimeout(() => {
			localStorage.setItem("todos-app", JSON.stringify(todos))
		}, 250)
		return () => clearTimeout(id)
	}, [todos])

	function handleSubmit(e) {
		e.preventDefault()
		funcs.addTodo()
	}

	return (
		<div>
			{/* prettier-ignore */}
			<form onSubmit={handleSubmit}>
				<input
					type="checkbox"
					checked={todos.done}
					onChange={e => funcs.setDone(e.target.checked)}
				/>
				<input
					type="text"
					value={todos.text}
					onChange={e => funcs.setText(e.target.value)}
				/>
				<button type="submit">+</button>
			</form>

			{todos.todos.map(each =>
				// prettier-ignore
				<div key={each.id}>
					<input
						type="checkbox"
						checked={each.done}
						onChange={e => funcs.setDoneByID(each.id, e.target.checked)}
					/>
					<input
						type="text"
						value={each.text}
						onChange={e => funcs.setTextByID(each.id, e.target.value)}
					/>
					<button onClick={() => funcs.removeTodoByID(each.id)}>-</button>
					<br />
				</div>,
			)}

			<p>You have count {meta.sum} todos!</p>

			{/* DEBUG */}
			<pre>{JSON.stringify({ todos, meta }, null, 2)}</pre>
		</div>
	)
}

export default function Root() {
	return (
		<RecoilRoot>
			<App />
		</RecoilRoot>
	)
}
