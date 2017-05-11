# beardude_event

1. event mgmt - website (heroku?)
    create at laptop, set a password

    - creates a public reg. page, using server user db


2. registration
    tablet (cellphone) - rfid reader
    PC - RFID Reader

    1. PC runs node.js, connects to event mgmt site by default (key)
    2. login event to mgmt
    3. scan rfid and bind with user. sends info back to event mgmt site


3. race
    1. PC (tablet) - network - (web interface + rpi + local logging) - rfid readers
    2. when race starts (manual set start time), PC start logging data from a specific reader (http address), and capture data during the race (manual start time + race logic of specific laps achieved first).
        - when behind first place rider's lap count, racer is marked DNF (still records time in case misjudge)
        - when first place rider finishes, race ends after first racer's last lap time x 2, otherwise DNF.
        - Race ends automatically
        - When done, list all racers' record, and allow judge to revise data (mark DNF or shift time)
        
    3. 



=======
賽事網站引擎

1. 選手登錄
 Basic info
    - name
    - age
    - email
    - phone
    - team 
    - pic

2. 加入賽事
    - 連結晶片ID
    - 拍照
 
3. 賽制
    預設賽制
      自動+手動分組 

      初賽：每組前x名晉級排位賽, y名複賽 (取x%進複賽1, y%進複賽2)
      複賽1：排順序 (取100%進決賽)
      複賽2：前z名晉級 (取z%進決賽)
      決賽：x+z競賽

線上報名
 - 確認繳費

現場登錄+發卡

