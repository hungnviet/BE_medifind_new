const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const { dirname, parse } = require('path');
const app = express();
app.use(express.json())
/// SEARCH  ------------------------------------------------------------------------------------------------------------------------
const list = JSON.parse(fs.readFileSync(`${__dirname}/vie.json`));

const getDrugWithName = (req, res) => {
    const name = req.params.name;

    const data = list.filter((el) => {
        const nameInList = el.tenThuoc.toLowerCase();
        return nameInList.includes(name.toLowerCase());
    })
    if (!data) {
        res.status(404).json({ status: "fail", message: "No drug found with this name" });
        return;
    }
    const result = [];
    const count = data.length > 5 ? 5 : data.length;
    for (let i = 0; i < count; i++) {
        const inforPobs = {
            ten: data[i].tenThuoc,
            hoatChatChinh: data[i].thongTinThuocCoBan ? data[i].thongTinThuocCoBan.hoatChatChinh : null,
            SDK: data[i].soDangKy,
            SQD: data[i].thongTinDangKyThuoc ? data[i].thongTinDangKyThuoc.soQuyetDinh : null,
            xuatSu: data[i].congTySanXuat ? data[i].congTySanXuat.nuocSanXuat : null,
            congTy: data[i].congTySanXuat ? data[i].congTySanXuat.tenCongTySanXuat : null,
            dangBaoChe: data[i].thongTinDangKyThuoc ? data[i].thongTinDangKyThuoc.dangBaoChe : null,
            diaChiSX: data[i].congTySanXuat ? data[i].congTySanXuat.diaChiSanXuat : null,
        };
        result.push(inforPobs);
    }

    res
        .status(200)
        .json({
            status: "success",
            data: { result }
        })
}
app
    .route("/api/v1/drug/:name")
    .get(getDrugWithName)
//// CHAT BOT -------------------------------------------------------------------------------------------------------------------------------
// Endpoint to get response from OpenAI API

const getReply = async (req, res) => {
    const content = Object.assign({ id: 1 }, req.body);


    const question = content.message;
    const apiKey = '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';
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const model = 'gpt-3.5-turbo';
    const messages = [{ role: 'user', content: `${question}` }];
    const temperature = 0.7;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ model, messages, temperature })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content
        res.json({
            status: "sccuess",
            reply: { reply },
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data from OpenAI' });
    }

};

app
    .route("/api/v1/chatBot")
    .get(getReply)
/// Reminder-------------------------------------------------------------------------------------------------------------
const listReminder = JSON.parse(fs.readFileSync(`${__dirname}/reminder.json`));
const getSchedule = (req, res) => {
    const name = req.params.name;

    const data = name === "morning" ? listReminder[0].morning : name === "noon" ? listReminder[0].noon : listReminder[0].everning;
    res
        .status(200)
        .json({
            status: "success",
            data: { data }
        })
}
const updateState = (req, res) => {
    const time = req.params.time;
    const idIn = req.params.id;
    const stateUpdated = req.params.stateUpdated;
    const id = parseInt(idIn);
    /*
    const listTask=time==="morning"?listReminder[0].morning:time=="noon"?listReminder[0].noon:listReminder[0].everning;
    const taskUpdated=listTask[id-1];
    taskUpdated.state=stateUpdated;
    khúc này có database thì đảy lên database
    */
    const newList = listReminder;
    if (time === "morning") {
        newList[0].morning[id - 1].state = stateUpdated;

    }
    if (time === "morning") {
        newList[0].noon[id - 1].state = stateUpdated;

    }
    if (time === "morning") {
        newList[0].everning[id - 1].state = stateUpdated;
    }
    fs.writeFile(`${__dirname}/reminder.json`, JSON.stringify(newList), err => {
        res
            .status(201)
            .json({
                status: "succes",
            });
    });

}
/// Scan-----------------------------------------------------------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const handleScan = async (req, res) => {
    const file = req.file;
    const formData = new FormData();
    formData.append("file", file.buffer, { filename: file.originalname });

    const apiOcr = "https://medifind-ocr.proudsea-d3f4859a.eastasia.azurecontainerapps.io/process_image";
    console.log("start");
    try {
        const response = await fetch(apiOcr, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
        });

        if (!response.ok) {
            console.log("Picture upload fail", response.status);
            res.status(response.status).json({ error: "Picture upload failed" });
        } else {
            const jsonArray = await response.json();
            const result = [];
            for (let i = 0; i < jsonArray.results.length; i++) {
                const inforPobs = {
                    ten: jsonArray.results[i].tenThuoc,
                    hoatChatChinh: jsonArray.results[i].thongTinThuocCoBan ? jsonArray.results[i].thongTinThuocCoBan.hoatChatChinh : null,
                    SDK: jsonArray.results[i].soDangKy,
                    SQD: jsonArray.results[i].thongTinDangKyThuoc ? jsonArray.results[i].thongTinDangKyThuoc.soQuyetDinh : null,
                    xuatSu: jsonArray.results[i].congTySanXuat ? jsonArray.results[i].congTySanXuat.nuocSanXuat : null,
                    congTy: jsonArray.results[i].congTySanXuat ? jsonArray.results[i].congTySanXuat.tenCongTySanXuat : null,
                    dangBaoChe: jsonArray.results[i].thongTinDangKyThuoc ? jsonArray.results[i].thongTinDangKyThuoc.dangBaoChe : null,
                    diaChiSX: jsonArray.results[i].congTySanXuat ? jsonArray.results[i].congTySanXuat.diaChiSanXuat : null,
                };
                result.push(inforPobs);
            }
            res.status(200).json(result);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing the image" });
    }

}

app.post("/api/v1/nlp", upload.single('file'), handleScan);

app
    .route("/api/v1/reminder/:name")
    .get(getSchedule)
app
    .route("/api/v1/reminder/:time/:id/:stateUpdated")
    .get(updateState)

///
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})
