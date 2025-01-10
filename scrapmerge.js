import * as Diff3 from "npm:node-diff3";
import { Command } from "https://deno.land/x/cliffy@v0.19.2/command/mod.ts";

function getPage(projectName, pageName) {
    return fetch(
        "https://scrapbox.io/api/pages/" +
            projectName +
            "/" +
            encodeURIComponent(pageName) + "/text",
    ).then((pageRes) => {
        if (pageRes.ok) {
            return pageRes.text();
        } else {
            return pageRes.text().then((text) => {
                console.error(pageRes.status, text);
            });
        }
    });
}
new Command()
    .name("scrapMerge")
    .arguments("<projectName> <mine> <older> <your>")
    .parse(Deno.args).then(({ args: [projectName, mine, older, your] }) => {
        return getPage(projectName, mine).then((
            mineData,
        ) => [mineData, mine, older, your, projectName]);
    }).then(([mineData, mine, older, your, projectName]) => {
        return getPage(projectName, older).then((
            olderData,
        ) => [mineData, olderData, mine, older, your, projectName]);
    })
    .then(([mineData, olderData, mine, older, your, projectName]) => {
        return getPage(projectName, your).then((
            yourData,
        ) => [mineData, olderData, yourData, mine, older, your, projectName]);
    }).then(
        ([mineData, olderData, yourData, mine, older, your, projectName]) => {
            const diff3dat = Diff3.mergeDiff3(mineData, olderData, yourData, {
                label: { a: mine, o: older, b: your },
                excludeFalseConflicts: true,
                stringSeparator: /\n/,
            });
            console.log(diff3dat.result.join("\n"));
        },
    );
