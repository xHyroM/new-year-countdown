import 'dotenv/config';
import { Client } from 'discord.js';
import { IntentsBitField } from 'discord.js';
import { readFileSync, writeFileSync } from 'node:fs';
import getTimezoneOffset from './getTimezoneOffset.js';
import moment from 'moment-timezone';

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    setInterval(() => {
        const cooldowns = [];

        for (const timezone of timezones.values()) {
            const currentTime = moment().tz(timezone);
            const utcOffset = currentTime.utcOffset();
            const utcOffsetHours = Math.floor(utcOffset / 60);
            const utcOffsetMinutes = Math.abs(utcOffset % 60);
    
            let formattedUtcOffset = "UTC";
            if (utcOffset > 0) {
                formattedUtcOffset += "+" + utcOffsetHours + ":" + utcOffsetMinutes;
            } else {
                formattedUtcOffset += "-" + Math.abs(utcOffsetHours) + ":" + utcOffsetMinutes;
            }
    
            if (currentTime.year() === 2023) {
                client.channels.cache.get('1058696238444335154').threads.cache.get('1058699350076837928').send(`Happy New Year ${timezone} (${formattedUtcOffset})`)
                timezones.delete(getTimezoneOffset(timezone));
    
                const oldContent = JSON.parse(readFileSync('timezones.json', 'utf-8'));
                oldContent.push({
                    timezone,
                    offset: getTimezoneOffset(timezone)
                });

                writeFileSync('./timezones.json', JSON.stringify(oldContent));
                continue;
            }
        
    
            const newYearEve = moment().tz(timezone).endOf('year').format();
    
            const countdown = moment.duration(moment(newYearEve).diff(currentTime));
            const hours = countdown.hours();
            const minutes = countdown.minutes();
            const seconds = countdown.seconds();
    
            cooldowns.push({
                timezone,
                offset: formattedUtcOffset,
                hours,
                minutes,
                seconds
            })
        }

        client.channels.cache.get('1058696238444335154').send(cooldowns.map(({ timezone, offset, hours, minutes, seconds }) => `**${timezone}** (**${offset}**): ${hours}h ${minutes}m ${seconds}s`).join('\n'));
    }, 1000);
});

const content = JSON.parse(readFileSync('./timezones.json', 'utf-8'));
const timezones = new Map();
for (const timezone of Intl.supportedValuesOf('timeZone')) {
    if (content.find(c => c.offset === getTimezoneOffset(timezone))) continue;

    timezones.set(getTimezoneOffset(timezone), timezone);
}

client.login(process.env.TOKEN);