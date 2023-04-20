let yourBearToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImNkeGROTFQiLCJlbWFpbCI6InVzZXJAeW9wbWFpbC5jb20iLCJEaXNwbGF5TmFtZSI6IlVzZXIiLCJyb2xlIjoiYWRtaW4iLCJNYUR2IjoiNTIwMDEiLCJuYmYiOjE2ODE4OTYwMTIsImV4cCI6MTY4MTk4MjQxMiwiaWF0IjoxNjgxODk2MDEyLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0Ojc3ODIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjQwMCJ9.ru7trRY0hYF93AQi1udgabbchZIbZ8TOKGG9PA8DkUA"

const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + yourBearToken
    },
    // body: JSON.stringify({title: 'new', post: 'new post'})
};

async function fetchData() {
    const response = await fetch('http://example.com/api/data');
    const data = await response.json();
    return data;
  }

for (let i = 2; i <= 10; i++) {
    const params = new URLSearchParams();
    params.append('_page', i);
    params.append('_limit', '10');

    fetch('http://localhost:7782/api/course?' + params.toString(), options)
        .then((res) => res.json())
        .then((data) => {
            console.log('check data', data.Data)

            const workbook = XLSX.utils.book_new();

            // Chuyển đổi dữ liệu thành định dạng Excel
            const worksheet = XLSX.utils.json_to_sheet(data.Data);

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'thongtinkhoahoc');
            console.log('check workbook', workbook)
            XLSX.writeFile(workbook, `thongtinkhoahoc_page${i}.xlsx`);
        })
        .catch(error => console.log('Error:', error))
        ;
}