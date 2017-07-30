# beardude_event

Beardude Event 用來管理單車比賽的賽制及流程，提供賽事管理介面以及選手報名與成績管理的功能。

Model:
![beardude event model1](https://cloud.githubusercontent.com/assets/6611716/26103132/a9dfc154-3a6a-11e7-86ac-3175496962db.jpg)


Scenarios:

編號(*done)| 時程   | 使用者   | Task         | Task-item   | API  | 說明
------ | ----- | ------- | ------------ | ------------ | ---- | ----
1.1    | 賽前   | 管理者   | 新增活動      |              | /event/create |
*1.2.1  |       |         | 修改活動內容   | 新增競賽組別   | /group/create |
*1.2.2  |       |         |              | 修改競賽組別   | /group/update |
*1.2.3  |       |         |              | 刪除競賽組別   | /group/delete |
-1.2.4  |       |         |              | 開放組別報名   | (刪掉)         |
*1.2.5  |       |         |              | 新增組別比賽   | /race/create   |
*1.2.6  |       |         |              | 刪除組別比賽   | /race/delete/:id |
*1.2.7  |       |         |              | 修改活動內容   | /event/update  |
*1.2.8  |       |         |              | 修改比賽內容   | /race/update  |
*1.2.9  |       |         |              | 設定比賽賽制   | /race/update |
*1.3    |       |         | 新增其他管理者 |               | /event/managers/add |
*1.4.1  |       |         | 修改參賽資料   | 修改隊伍資料   | /team/update    |
-1.4.2  |       |         |              | 刪除隊伍      | /team/delete   |
-1.4.3  |       |         |              | 修改付款狀態   | /reg/updatePayment |
-1.4.4  |       |         |              | 退款          | /reg/refunded    |
1.4.5  |       |         |              | 將選手加入比賽  | /race/racers/add    |
1.4.6  |       |         |              | 將選手移出比賽  |  /race/racers/remove    |
*1.5    |       |         | 帳號管理      |               |  /manager/*       |
*1.6    |       |         | 刪除活動      |               | /event/delete          |
1.7.1  |       |         | 分配選手    |               |  | /race/regs/assignRegsToRaces
1.7.2  |       |         | 移動選手    |               |  同上|
2.1    |       | 參賽者   | 註冊帳號      |               | (刪掉, 應該是報名比賽同時註冊) |
2.2.1  |       |         | 報名比賽      | 個人報名(已登入)| /reg/create    |
2.2.2  |       |         |              | 隊伍報名       | |
-2.2.3  |       |         |              | 退款&取消報名   | /reg/requestRefund    |
-2.2.4  |       |         |              | 付款&完成報名   | /reg/confirm    | 分配選手背號
-2.2.5  |       |         |              | 註冊&報名      | /reg/signupAndCreate     |
2.3.1  |       |         | 修改資料      | 修改個人資料    | /racer/update    |
2.3.2  |       |         |              | 修改隊伍資料    | /team/update    |
-2.3.3  |       |         |              | 新增隊伍       | /team/create    |
-2.3.4  |       |         |              | 刪除隊伍       | /team/delete    |
-2.3.5  |       |         |              |  邀請加入隊伍   | /team/invite    |
-2.3.6  |       |         |              | 同意邀請加入隊伍 | /team/acceptInvitation |
-2.3.7  |       |         |              | 新增隊員        | /team/addRacer    |
-2.3.8  |       |         |              | 刪除隊員       | /team/removeRacer    |
2.4    |       |         |              | 帳號管理        | /racer/*            |
3.1    |       |  觀眾    | 觀看比賽動態   | 觀看活動內容    | /event/info/:id   |
3.2    |       |         | 觀看賽程      | 觀看組別內容    | /group/info/:id    |
3.3    |       |         | 觀看報名隊伍   | 觀看活動內容    | (同上)              |
3.4    |       |         | 觀看選手名單   | 觀看活動內容    | (同上)              |
4.1.1  | 比賽準備 | 管理者 | 選手報到       | 分配RFID       | /event/rfid/reg    |
-4.1.2  |        |         |             | 更換RFID       |    |
4.2.1  |        |         | 系統測試     | 測試RFID天線訊號 |                    |
4.2.2  |        |         |             | 測試完整比賽流程  |                    |
*4.2.3  |        |         |             | 註冊測試用RFID  | /event/rfid/tester |
4.2.4  |        |         |             | 啟動RFID Reader  |                  |
4.2.5  |        |         |             | 接RFID Reader資料 |                  |
4.2.6  |        |         |             | 關閉RFID Reader |                  |
5.1.1  |        | 參賽者   | 報到        | 開啟報名單號     | /reg/getInfo        |
5.1.2  |        |         |            | 查詢報名狀態     | /reg/getInfo        |
5.2.1  |        |         | 觀看比賽動態 | 觀看賽程        | /group/info/:id     |
5.2.2  |        |         |            | 查詢報名隊伍     | (同上)               |
5.2.3  |        |         |            | 查詢選手名單     |  (同上)              |
n/a    |        |  觀眾    | (同3.1)      |      n/a         |   n/a       |
6.1.1  | 比賽期間 | 管理者  | 觀看賽程       | 查詢目前比賽流程 | /group/info:id    |
6.1.2  |        |         |              | 查詢選手名單     | /race/mgmtInfo/:id    |
6.2.1  |        |         | 準備比賽      | 開啟比賽            |           |
6.2.3  |        |         |             | 開始選手登錄         |  /reg/admitRacer   |
-6.2.4  |        |         |             | (登錄失敗)判讀選手狀態 | /race/assignRegsToRaces,<br> /reg/admitRacer |
-6.2.5  |        |         |             | (登錄失敗)更換選手RFID | /reg/replaceRfid<br>  /reg/admitRacer |
*6.2.6  |        |         |             | 登錄Pacer ID        | /event/rfid/pacer    |
6.2.7  |        |         |             | 確認選手登錄狀態       | /race/mgmtInfo/:id    |
6.2.8  |        |         |             | 宣讀規則             |  /race/mgmtInfo/:id    |
6.2.9  |        |         |             | 啟動RFID Reader    |         |顯示收發訊號, 將testerEPC從Event複製到Race
6.2.10  |        |         |             | 啟動試跑模式       |         |
4.2.10  |        |         |             | 接RFID Reader資料 |                  |
6.2.11 |        |         |             | 啟動比賽開始倒數      |                |
6.3.1  |        |         | 比賽裁判     | 即時顯示通過閘門選手    |  /race/mgmtInfo/:id   |
6.3.2 |        |         |             |  顯示遭pacer套圈選手資料 |  (同上)   |
6.3.3 |        |         |             |  確認套圈選手離場     | (同上)    |
6.3.4 |        |         |             |  完成比賽成績確認     | (同上)    |
6.3.5 |        |         |             |  中斷比賽           |          |
-6.3.6 |        |         |             |  取消選手資格        | /reg/updateDisqualification |
6.3.7 |        |         |             |  計算晉級名單        |  |
6.3.8 |        |         |             |  關閉RFID Reader    |         |
6.3.9 |        |         |             |  新增選手比賽筆記     | /registration/updateRaceNote  |
6.3.10 |        |         |             |  計算晉級&送出比賽結果        | /race/submitResult |
7.1.1  |        | 選手    | 檢視賽程       | 顯示目前成績與資格 | /race/info/:id  |
7.1.2  |        |        |             | 顯示下一場上場時間  |              |
7.1.3  |        |        |             | 顯示成績          |  /race/info/:id   |
 n/a    |        |  觀眾   | (同3.1)      |      n/a         |    n/a    |
8.1    | 賽後    |         | 檢視成績       |              | /event/info/:id |
8.2    |         |  選手   | 歸還Rfid   |              | event/rfid/recycle  |


安裝與執行

> npm i

> npm run start

===

DEV (need two screen):

one screen (API)
> npm run start

the other (frontend)
> npm run dev (enter rs if reload fail or seems strange)

GO TO http://localhost:8080/

===
Wireframe
![beardude race wireframe ver1](https://user-images.githubusercontent.com/6611716/27020412-b7552d10-4f73-11e7-8c01-3b22ca7f1a7d.jpg)
