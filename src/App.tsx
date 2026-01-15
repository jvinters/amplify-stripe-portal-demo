import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {  
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [hello, setHello] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Schema["getSubscription"]["type"] | null>(null);

  useEffect(() => {
    client.queries.sayHello({
      name: "Amplify",
    }).then((data) => setHello(data.data ?? "No data"));
  }, []);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  useEffect(() => {
    client.queries.getSubscription().then((data) => setSubscription(data.data ?? { ok: false, subscriptionId: null, subscriptionStatus: null }));
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }
    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main>      
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <p>{hello}</p>
      <p>Subscription ID: {subscription?.subscriptionId}</p>
      <p>Subscription Status: {subscription?.subscriptionStatus}</p>
      <p>Subscription OK: {subscription?.ok ? "Yes" : "No"}</p>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
