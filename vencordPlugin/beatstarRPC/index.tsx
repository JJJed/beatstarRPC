/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings, Settings } from "@api/Settings";
import { Link } from "@components/Link";
import { Devs } from "@utils/constants";
import { isTruthy } from "@utils/guards";
import { useAwaiter } from "@utils/react";
import definePlugin, { OptionType } from "@utils/types";
import { filters, findByCodeLazy, findByPropsLazy, mapMangledModuleLazy } from "@webpack";
import { FluxDispatcher, Forms, GuildStore, React, SelectedChannelStore, SelectedGuildStore, UserStore } from "@webpack/common";

const ActivityComponent = findByCodeLazy("onOpenGameProfile");
const ActivityClassName = findByPropsLazy("activity", "buttonColor");
const Colors = findByPropsLazy("profileColors");

const assetManager = mapMangledModuleLazy(
    "getAssetImage: size must === [number, number] for Twitch",
    {
        getAsset: filters.byCode("apply("),
    }
);

async function getApplicationAsset(key: string): Promise<string> {
    if (/https?:\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\//.test(key)) return "mp:" + key.replace(/https?:\/\/(cdn|media)\.discordapp\.(com|net)\//, "");
    return (await assetManager.getAsset("1157305973849989233", [key, undefined]))[0];
}

interface ActivityAssets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
}

interface Activity {
    state?: string;
    details?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    assets?: ActivityAssets;
    buttons?: Array<string>;
    name: string;
    application_id: string;
    metadata?: {
        button_urls?: Array<string>;
    };
    type: ActivityType;
    url?: string;
    flags: number;
}

const enum ActivityType {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    COMPETING = 5
}

const enum TimestampMode {
    NONE,
    NOW,
    TIME,
    CUSTOM,
}

function onChange() {
    setRpc(true);
    if (Settings.plugins.BeatstarRPC.enabled) setRpc();
}

async function createActivity(): Promise<Activity | undefined> {

    const requestOptions: RequestInit = {
        keepalive: true,
        mode: "cors"
    };

    var appID = "1157305973849989233";
    var appName = "Beatstar";
    var type = ActivityType.PLAYING;
    const response0 = await fetch('http://127.0.0.1:5000/details', requestOptions);
    var details = await response0.text().then(result => result);
    const response1 = await fetch('http://127.0.0.1:5000/state', requestOptions);
    var state = await response1.text().then(result => result);
    const response2 = await fetch('http://127.0.0.1:5000/imageBig', requestOptions);
    var imageBig = await response2.text().then(result => result);
    const response3 = await fetch('http://127.0.0.1:5000/imageSmall', requestOptions);
    var imageSmall = await response3.text().then(result => result);
    const response4 = await fetch('http://127.0.0.1:5000/buttonOneText', requestOptions);
    var buttonOneText = await response4.text().then(result => result);
    const response5 = await fetch('http://127.0.0.1:5000/buttonOneURL', requestOptions);
    var buttonOneURL = await response5.text().then(result => result);
    var buttonTwoText = "beatstarRPC GitHub Repo";
    var buttonTwoURL = "https://github.com/JJJed/beatstarRPC";

    if (!appName) return;

    const activity: Activity = {
        application_id: appID,
        name: appName,
        state: state,
        details: details,
        type: type,
        flags: 1 << 0,
    };

    if (buttonOneText) {
        activity.buttons = [
            buttonOneText,
            buttonTwoText
        ].filter(isTruthy);

        activity.metadata = {
            button_urls: [
                buttonOneURL,
                buttonTwoURL
            ].filter(isTruthy)
        };
    }

    if (imageBig) {
        activity.assets = {
            //large_image: await getApplicationAsset(imageBig),
            large_image: await getApplicationAsset(imageBig),
            large_text: undefined
        };
    }

    if (imageSmall) {
        activity.assets = {
            ...activity.assets,
            small_image: await getApplicationAsset(imageSmall),
            small_text: undefined
        };
    }


    for (const k in activity) {
        if (k === "type") continue;
        const v = activity[k];
        if (!v || v.length === 0)
            delete activity[k];
    }

    return activity;
}

async function setRpc(disable?: boolean) {
    const activity: Activity | undefined = await createActivity();

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: !disable ? activity : null,
        socketId: "BeatstarRPC",
    });
}

setInterval(function () {
    setRpc();
}, 5000);

// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
export default definePlugin({
    name: "BeatstarRPC",
    description: "Allows you to set a detailed Beatstar rich presence.",
    authors: [
        {
            id: 270232807744208898n,
            name: "Jed"
        }
    ],
    start: setRpc,
    stop: () => setRpc(true),

    settingsAboutComponent: () => {
        const activity = useAwaiter(createActivity);
        return (
            <>
                <Forms.FormText>
                    <a href="https://github.com/JJJed/beatstarRPC/tree/master">beatstarRPC GitHub Repo</a>
                </Forms.FormText>
                <Forms.FormDivider />
                <div style={{ width: "284px" }} className={Colors.profileColors}>
                    {activity[0] && <ActivityComponent activity={activity[0]} className={ActivityClassName.activity} channelId={SelectedChannelStore.getChannelId()}
                        guild={GuildStore.getGuild(SelectedGuildStore.getLastSelectedGuildId())}
                        application={{ id: "1157305973849989233" }}
                        user={UserStore.getCurrentUser()} />}
                </div>
            </>
        );
    }
});
