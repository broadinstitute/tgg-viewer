task convert_SJ_out_tab_to_junctions_bed {

    File SJ_out_tab_file
    String prefix

    Int disk_space = ceil(3*size(SJ_out_tab_file, "GB"))

    command {
        set -euo pipefail
        python3 /convert_SJ_out_tab_to_junctions_bed.py ${SJ_out_tab_file} -o ${prefix}.junctions.bed
    }

    output {
        File junctions_bed = "${prefix}.junctions.bed.gz"
        File junctions_bed_tbi = "${prefix}.junctions.bed.gz.tbi"
    }

    runtime {
        docker: "weisburd/rnaseq-utils:v1"
        memory: "1GB"
        disks: "local-disk ${disk_space} HDD"
        cpu: "1"
        preemptible: "3"
    }
}


workflow convert_SJ_out_tab_to_junctions_bed_workflow {
    call convert_SJ_out_tab_to_junctions_bed
}
