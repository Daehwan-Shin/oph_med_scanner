export default function DrugCard({ item, onOpen }: { item: any, onOpen: (id: string)=>void }) {
  return (
    <li style={{ border: "1px solid #ddd", margin: 8, padding: 8, borderRadius: 8 }}>
      <b>{item.name}</b>
      <div>{item.company}</div>
      <div>{[item.form, item.route, item.strength].filter(Boolean).join(" · ")}</div>
      <button onClick={() => onOpen(String(item.id))} style={{ marginTop: 6 }}>상세</button>
    </li>
  );
}
