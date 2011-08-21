package com.listomate;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.DatePicker;
import android.widget.TextView;

public class AddTaskActivity extends Activity {

    private TextView titleTextView;
    private DatePicker datePicker;
    private TextView detailsTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.addtask);

        titleTextView = (TextView) findViewById(R.id.titleText);
        datePicker = (DatePicker) findViewById(R.id.datePicker);
        detailsTextView = (TextView) findViewById(R.id.detailsText);
    }

    public void onSave(View view) {
        String taskName = titleTextView.getText().toString();
        if (taskName.length() > 0) {
            Intent t = new Intent();
            t.putExtra("task", taskName);
            t.putExtra("details", detailsTextView.getText().toString());

            t.putExtra("day", datePicker.getDayOfMonth());
            t.putExtra("month", datePicker.getMonth());
            t.putExtra("year", datePicker.getYear());

            setResult(Activity.RESULT_OK, t);
        } else {
            setResult(Activity.RESULT_CANCELED);
        }

        finish();
    }

    public void onCancel(View view) {
        setResult(Activity.RESULT_CANCELED);

        finish();
    }
}
