import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { Button } from "@/components/ui/button"

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
      <h1 className="text-2xl font-bold">{user?.signInDetails?.loginId}'s todos</h1>
      <p className="text-lg">{hello}</p>
      <p className="text-lg">Subscription ID: {subscription?.subscriptionId}</p>
      <p className="text-lg">Subscription Status: {subscription?.subscriptionStatus}</p>
      <p className="text-lg">Subscription OK: {subscription?.ok ? "Yes" : "No"}</p>
      <Button onClick={createTodo}>+ new</Button>
      <ul className="list-none">
        {todos.map((todo) => (
          <li className="bg-white p-2 rounded-md" key={todo.id} onClick={() => deleteTodo(todo.id)}>{todo.content}</li>
        ))}
      </ul>
      <Button onClick={signOut}>Sign out</Button>
    </main>
  );
}

export default App;
