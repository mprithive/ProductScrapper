export function isNumberString(value) {
    return typeof value === "string" && !isNaN(value) && value.trim() !== "";
}