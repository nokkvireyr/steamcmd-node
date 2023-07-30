# This project is no longer in development and is considered not safe to use in production.
# DEPRECATED.

# steamcmd-node
Node library to call the SteamCMD client.

## Install
    npm i steamcmd-node 

## Examples
### Execute raw command lines on steamcmd

    const { SteamCMD } = require('steamcmd-node'); // Commonjs Import
    import { SteamCMD } from 'steamcmd-node'; // ES6 Import

    const steamcmd = new SteamCMD();

    /*
    *   SteamCMD command args
    *   Initial parameters need '+' infront
    *   ex: +app_update
    */
    const commandARG = [
        '+app_update', 730,
        '+validate'
    ];

    /*
    *   Returns the steamcmd output
    */
    const res = await steamcmd.execRaw(commandARG);


### Fetch application info

    const { SteamCMD } = require('steamcmd-node'); // Commonjs Import
    import { SteamCMD } from 'steamcmd-node'; // ES6 Import 

    const steamcmd = new SteamCMD();

    /*
    *   Returns json of the app info
    */
    const res = await steamcmd.appInfo({appid: 730});

### Update application

    const { SteamCMD } = require('steamcmd-node'); // Commonjs Import
    import { SteamCMD } from 'steamcmd-node'; // ES6 Import

    const steamcmd = new SteamCMD();

    /*
    *   Returns json object with message if it was successful or not
    */
    const res = await steamcmd.updateApp({appid: 730});    

### Update application

    const { SteamCMD } = require('steamcmd-node'); // Commonjs Import
    import { SteamCMD } from 'steamcmd-node'; // ES6 Import

    const steamcmd = new SteamCMD();

    /*
    *   Returns json object with message if it was successful or not
    */
    const res = await steamcmd.installApp({appid: 730});  

## Note you do not need to pass the login parameter for steamcmd as it automaticly logs you in as anonymous
