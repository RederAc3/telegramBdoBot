# BDOBot
#### The script automates card generation and printing in the [BDO system](https://bdo.mos.gov.pl/).
#### Works as a bot on a telegram.

## Installation:
```
1. npm i 
```
2. Create a new Telegram bot using the [Bot Father](https://telegram.me/botfather).
3. Fill in the data in [.env_template](/.env_template) and change the name to .env.


## Run:
```
pm2 start start.js --name BDOBot
```
## Usage:

<details><summary>CREATE</summary>
<p>

#### /create [ weight(Mg) ] [ type(złom/wióry) ] [ vehicle reg. number ] [ time(hh:mm) ] [ date(rrrr:mm:dd) ]
    
     /create 5.200 złom SK4T78 09:20 2022-03-20

</p>
</details>
<details><summary>PRINT</summary>
<p>

#### /print [ kpoId ]  
##### Only works on Linux devices where the printer is connected.
    
     /print 1a3fc0e0-274b-4eeb-8d6d-7cffb3cb3600
    
</p>
</details>

