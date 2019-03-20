<template lang="pug">
div
    form(@submit.prevent="autoselect")
        md-field.search-box
            label Search
            md-input#search-member(v-model="search", autocomplete="off", autofocus)

    md-card
        md-card-content
            md-list.md-double-line
                md-list-item(v-for="mem of filteredMembers", :key="mem.id", @click="select(mem)")
                    div.md-list-item-text
                        span {{mem.firstName}} {{mem.lastName}}

                        span(v-if="mem.access") {{mem.access}}
                        span(v-else) NO ACCESS

                    md-icon(v-if="!mem.registered") person_outline
                    md-icon(v-if="attended(mem.id)") check

</template>

<script>
import state from '../state';
const ACCESS_BARCODE_RE = /^9[012]0000(\d{7})$/;
export default {
    name: 'EventAttendance',
    data () {
        return {
            search: '',
            shared: state
        }
    },
    computed: {
        eventAttendance() {
            return this.shared.attendance.filter(a => a.event.id == this.$route.params.id);
        },
        filteredMembers() {
            let searchFields = ["firstName", "lastName"];
            let query = this.search;
            let match;
            if ((match = /^[0F]9(\d{9})\d{2}\d{2}$/.exec(query))) {
                // old SID library barcode: 09<SID><YY><CK>
                // new SID library barcode: F9<SID><YY><CK>
                query = [match[1]];
                searchFields = ["sid"];
            } else if (/^\d+$/.test(query)) {
                // numeric. let's check if it's a barcode
                searchFields = ["access", "sid"];
                if ((match = ACCESS_BARCODE_RE.exec(query))) {
                    // ACCESS card/app barcodes
                    query = String(+match[1]);
                    searchFields = ["access"];
                } else if ((match = /^0055(\d{7})\d{2}\d{2}$/.exec(query))) {
                    // staff library barcode: 0055<SID><YY><CK>
                    query = match[1];
                    searchFields = ["sid"];
                } else if (query.length > 9 || query.startsWith("09")) {
                    // probably the start of a barcode, short circuit and wait for the full thing
                    return [];
                }
                query = [query];
            } else if (query.startsWith("F9")) {
                // definitely the start of a new SID barcode
                return [];
            } else {
                query = query.toLowerCase().split(/\s+/g);
            }

            let filteredMembers = [];
            for (let mem of this.shared.members) {
                let matches = true;
                for (let word of query) {
                    let wordMatches = false;
                    for (let field of searchFields) {
                        if (mem[field] && String(mem[field]).toLowerCase().includes(word)) {
                            wordMatches = true;
                            break;
                        }
                    }
                    if (!wordMatches) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    filteredMembers.push(mem);
                    // limit number of results to reduce render time
                    if (filteredMembers.length == 10) {
                        break;
                    }
                }
            }
            return filteredMembers;
        },
    },
    methods: {
        attended(id) {
            return this.eventAttendance.find(a => a.member.id == id);
        },
        select(mem) {
            this.shared.selectMember(mem.id);
        },
        autoselect() {
            let match;
            if (this.filteredMembers.length == 1) {
                this.select(this.filteredMembers[0]);
            } else if (this.filteredMembers.length == 0 && (match = ACCESS_BARCODE_RE.exec(this.search))) {
                this.$emit("unknown-access", +match[1]);
            }
        },
        selectSearchBox() {
            let input = document.getElementById("search-member");
            input.select();
            input.focus();
        }
    }
}
</script>

<style lang="sass">
// fix bug in vue-material
.md-list-item-text .md-icon
    width: 24px !important
</style>
