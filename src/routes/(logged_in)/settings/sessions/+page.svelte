<script lang='ts'>
    import { request } from "$lib/request";
    import type { Session } from "$lib/types/session";

    const PLATFORM_ICONS = {
        windows: "M3 12V6.75l6-1.32v6.48zm17-9v8.75l-10 .15V5.21zM3 13l6 .09v6.81l-6-1.15zm17 .25V22l-10-1.91V13.1z",
        linux: "M14.62 8.35c-.42.28-1.75 1.04-1.95 1.19c-.39.31-.75.29-1.14-.01c-.2-.16-1.53-.92-1.95-1.19c-.48-.31-.45-.7.08-.92c1.64-.69 3.28-.64 4.91.03c.49.21.51.6.05.9m7.22 7.28c-.93-2.09-2.2-3.99-3.84-5.66a4.3 4.3 0 0 1-1.06-1.88c-.1-.33-.17-.67-.24-1.01c-.2-.88-.29-1.78-.7-2.61c-.73-1.58-2-2.4-3.84-2.47c-1.81.05-3.16.81-3.95 2.4c-.21.43-.36.88-.46 1.34c-.17.76-.32 1.55-.5 2.32c-.15.65-.45 1.21-.96 1.71c-1.61 1.57-2.9 3.37-3.88 5.35c-.14.29-.28.58-.37.88c-.19.66.29 1.12.99.96c.44-.09.88-.18 1.3-.31c.41-.15.57-.05.67.35c.65 2.15 2.07 3.66 4.24 4.5c4.12 1.56 8.93-.66 9.97-4.58c.07-.27.17-.37.47-.27c.46.14.93.24 1.4.35c.49.09.85-.16.92-.64c.03-.26-.06-.49-.16-.73",
        mac: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47c-1.34.03-1.77-.79-3.29-.79c-1.53 0-2 .77-3.27.82c-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51c1.28-.02 2.5.87 3.29.87c.78 0 2.26-1.07 3.81-.91c.65.03 2.47.26 3.64 1.98c-.09.06-2.17 1.28-2.15 3.81c.03 3.02 2.65 4.03 2.68 4.04c-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5c.13 1.17-.34 2.35-1.04 3.19c-.69.85-1.83 1.51-2.95 1.42c-.15-1.15.41-2.35 1.05-3.11",
        android: "M16.61 15.15c-.46 0-.84-.37-.84-.83s.38-.82.84-.82s.84.36.84.82s-.38.83-.84.83m-9.2 0c-.46 0-.84-.37-.84-.83s.38-.82.84-.82s.83.36.83.82s-.37.83-.83.83m9.5-5.01l1.67-2.88c.09-.17.03-.38-.13-.47c-.17-.1-.38-.04-.45.13l-1.71 2.91A10.15 10.15 0 0 0 12 8.91c-1.53 0-3 .33-4.27.91L6.04 6.91a.334.334 0 0 0-.47-.13c-.17.09-.22.3-.13.47l1.66 2.88C4.25 11.69 2.29 14.58 2 18h20c-.28-3.41-2.23-6.3-5.09-7.86",
        ios: "M2.09 16.8h1.66V9.76H2.09m.83-.92a.9.9 0 0 0 .92-.9c0-.5-.4-.9-.92-.9a.9.9 0 0 0-.92.9c0 .5.4.9.92.9m6.33-1.78C6.46 7.06 4.7 8.96 4.7 12c0 3.06 1.76 4.96 4.55 4.96s4.55-1.9 4.55-4.96c0-3.04-1.76-4.94-4.55-4.94m0 1.44c1.71 0 2.8 1.37 2.8 3.5c0 2.15-1.09 3.5-2.8 3.5S6.46 14.15 6.46 12c0-2.13 1.08-3.5 2.79-3.5m5.25 5.61c.07 1.76 1.5 2.85 3.72 2.85c2.32 0 3.78-1.14 3.78-2.96c0-1.43-.82-2.23-2.77-2.68l-1.1-.25c-1.18-.28-1.66-.65-1.66-1.29c0-.78.73-1.33 1.81-1.33c1.1 0 1.85.55 1.93 1.44h1.63c-.04-1.69-1.43-2.83-3.55-2.83c-2.08 0-3.56 1.15-3.56 2.85c0 1.37.83 2.22 2.6 2.62l1.24.29c1.21.29 1.7.68 1.7 1.38c0 .8-.8 1.37-1.96 1.37s-2.05-.57-2.15-1.46z",
    }
    
    const CLIENT_ICONS = {
        // TODO: replace
        pengin: "M19 16c0 1.72-.63 3.3-1.66 4.5c.41.39.66.91.66 1.5H6c0-.59.25-1.11.66-1.5A6.9 6.9 0 0 1 5 16H3c0-1.25.57-2.36 1.46-3.09l.01-.02A6 6 0 0 0 7 8V7a5 5 0 0 1 5-5a5 5 0 0 1 5 5v1c0 2 1 3.81 2.53 4.89l.01.02c.89.73 1.46 1.84 1.46 3.09zm-3 0a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4m-6-7l2 1.5L14 9l-2-1.5zm0-4a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1m4 0a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1",
        curl: "M18 20h-4l4-16h4m-6 0h-4L8 20h4M2 16.5A2.5 2.5 0 0 0 4.5 19 2.5 2.5 0 0 0 7 16.5 2.5 2.5 0 0 0 4.5 14 2.5 2.5 0 0 0 2 16.5m0-7A2.5 2.5 0 0 0 4.5 12 2.5 2.5 0 0 0 7 9.5 2.5 2.5 0 0 0 4.5 7 2.5 2.5 0 0 0 2 9.5z"
    }
    
    const UNKNOWN_ICON = "M11 18h2v-2h-2zm1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-14a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2a2 2 0 0 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4"

    const fetch_sessions = async (): Promise<Session[]> => {
        return await request("GET", "sessions");
    }

    const to_timestamp = (id: number) => {
        // TODO: fix
        const ELUDRIS_EPOCH = 1_650_000_000;
        console.log(id)
        return new Date((id >>> 16) + ELUDRIS_EPOCH);
    }
</script>


{#await fetch_sessions()}
    <h4>Doodoo</h4>
{:then sessions}
    <!-- <table>
        <tr>
            <td>IP Address</td>
            <td>Platform</td>
            <td>Client</td>
        </tr> -->
    <div class="sessions">
        {#each sessions as session (session.id)}
            <div class="session-container">
                <div class="session-icon-wrapper">
                    <svg class="platform-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d={PLATFORM_ICONS[session.platform] ?? UNKNOWN_ICON}/>
                    </svg>
                    <svg class="client-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d={CLIENT_ICONS[session.client] ?? UNKNOWN_ICON}/>
                    </svg>
                </div>
                <div class="session-data">
                    <h3>{`${session.client} on ${session.platform}`}</h3>
                    <div class="session-ip">{`IP: 69.420.13.37:84115`}</div>
                    <div class="session-timestamp">{`Created At: ${to_timestamp(session.id).toLocaleString()}`}</div>
                </div>
            </div>
        {/each}
    </div>
    <!-- </table>     -->
{/await}


<style>
    .sessions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 60%
    }

    .session-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 5px;
        background-color: var(--gray-200);
        border-radius: 10px;
        gap: 5px;
    }

    .session-icon-container {
        position: relative;
    }

    .session-icon-wrapper {
        position: relative;
        height: 60px;
        width: 60px;
    }

    .platform-icon {
        position: absolute;
        clip-path: polygon(0 0, calc(66% - 2px) 0, calc(33% - 2px) 100%, 0 100%);
        height: 100%;
        width: 100%;
    }

    .client-icon {
        position: absolute;
        clip-path: polygon(calc(66% + 2px) 0, 100% 0, 100% 100%, calc(33% + 2px) 100%);
        height: 100%;
        width: 100%;
    }

    h3 {
        margin-top: 0;
    }

</style>
