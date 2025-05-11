const API='https://tu-api-production.up.railway.app'; // cambia por tu dominio real
const tbody=document.querySelector('#items tbody');
const form=document.getElementById('item-form');
let editingId=null;
async function refresh(){
  const res=await fetch(`${API}/items`);
  const data=await res.json();
  tbody.innerHTML=data.map(r=>`<tr>
    <td>${r.id}</td><td>${r.title}</td><td>${r.description??''}</td>
    <td><button onclick="edit(${r.id},'${r.title}','${r.description??''}')">✏️</button>
        <button onclick="del(${r.id})">🗑️</button></td></tr>`).join('');
}
window.edit=(id,title,description)=>{editingId=id;form.title.value=title;form.desc.value=description;}
window.del=async id=>{await fetch(`${API}/items/${id}`,{method:'DELETE'});refresh();}
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const body=JSON.stringify({title:form.title.value,description:form.desc.value});
  const opts={method:editingId?'PUT':'POST',headers:{'Content-Type':'application/json'},body};
  const url=editingId?`${API}/items/${editingId}`:`${API}/items`;
  await fetch(url,opts);editingId=null;form.reset();refresh();
});
refresh();
